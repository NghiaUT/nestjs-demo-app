import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Or, Repository } from 'typeorm';
import { Order, OrderStatus } from './entity/order.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Product } from '../product/entity/product.entity.js';
import { OrderItem } from './entity/order-item.entity.js';
import { randomUUID } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema.js';

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Gộp số lượng để tránh gửi trùng id và sorting để tránh deadlock.
    const qtyByProduct = new Map<string, number>();
    for (const { productId, quantity } of dto.items) {
      qtyByProduct.set(productId, (qtyByProduct.get(productId) ?? 0) + 1);
    }
    const productIds = [...qtyByProduct.keys()].sort((a, b) =>
      b.localeCompare(a),
    );

    return this.dataSource.transaction(async (manager) => {
      // 2. Tìm kiếm và khóa lock các hàng product.
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
        order: { id: 'ASC' },
        lock: { mode: 'pessimistic_write' },
      });

      if (products.length !== productIds.length) {
        const found = new Set(products.map((p) => p.id));
        const missing = productIds.filter((id) => !found.has(id));
        throw new NotFoundException(
          `Không tìm thấy sản phẩm: ${missing.join(',')}`,
        );
      }

      // 3. Kiểm tra kho, tính tiền, dựng order items
      let totalAmount = 0;
      const items: OrderItem[] = [];

      for (const product of products) {
        const quantity = qtyByProduct.get(product.id)!;

        if (product.stock < quantity) {
          throw new BadRequestException(
            `"${product.name}" chỉ còn ${product.stock}, bạn đã đặt quá số lượng tồn kho.`,
          );
        }

        await manager.decrement(Product, { id: product.id }, 'stock', quantity);

        totalAmount += product.price * quantity;
        items.push(
          manager.create(OrderItem, {
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            quantity,
          }),
        );
      }

      const order = manager.create(Order, {
        code: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
        customerName: dto.customerName,
        note: dto.note ?? null,
        totalAmount,
        items,
      });

      return manager.save(order);
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return order;
  }

  async list(page = 1, limit = 20) {
    const [orders, total] = await this.orderRepo.findAndCount({
      relations: { items: true },
      order: { createdAt: 'DESC' },
      skip: limit * (page - 1),
      take: limit,
    });

    const users = await this.userModel.find().select('-password').exec();

    return { orders, users, total, page, limit };
  }

  async cancel(id: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
      if (order.status === OrderStatus.CANCELLED)
        throw new BadRequestException('Đơn hàng bị hủy trước đó');
      if (order.status === OrderStatus.PAID)
        throw new BadRequestException('Đơn hàng đã thanh toán, không thể hủy');

      const items = await manager.find(OrderItem, {
        where: { orderId: id },
        order: { productId: 'ASC' }, // Thứ tự cố định tránh deadlock
      });

      for (const item of items) {
        await manager.increment(
          Product,
          { id: item.productId },
          'stock',
          item.quantity,
        );
      }

      order.status = OrderStatus.CANCELLED;
      return manager.save(order);
    });
  }
}
