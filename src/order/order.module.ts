import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity.js';
import { Product } from '../product/entity/product.entity.js';
import { OrderItem } from './entity/order-item.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, OrderItem])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
