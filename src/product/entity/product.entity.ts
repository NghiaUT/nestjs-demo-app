import { Check, Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entity/base.entity.js';

@Entity('products')
@Check('"stock" >= 0') // Chặn ở DB: đảm bảo không bao giờ âm kho
export class Product extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int' })
  price: number; // VNĐ

  @Column({ type: 'int', default: 0 })
  stock: number;
}
