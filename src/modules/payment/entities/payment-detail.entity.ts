import { ParentEntity } from 'src/common/entities/parent.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PaymentDetail extends ParentEntity {
  @Column({ type: 'int' })
  product_count: number;

  @ManyToOne(() => Product, (product: Product) => product.product_details, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  product: Product;

  @ManyToOne(() => Payment, (payment: Payment) => payment.payment_details)
  payment: Payment;
}
