import { Column, Entity, OneToMany, type Relation } from 'typeorm';
import { bigintToNumber } from '../../utils/transform.js';
import { OrderItem } from './order-item.entity.js';
import { BaseEntity } from '../../common/entity/base.entity.js';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ length: 32, unique: true })
  code: string;

  @Column({ length: 100 })
  customerName: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status',
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'bigint', transformer: bigintToNumber })
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: ['insert'] })
  items: Relation<OrderItem[]>;
}
