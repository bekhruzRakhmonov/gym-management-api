import { ParentEntity } from 'src/common/entities/parent.entity';
import { Inventory } from 'src/modules/inventory/entities/inventory.entity';
import { PaymentDetail } from 'src/modules/payment/entities/payment-detail.entity';
import { Payment } from 'src/modules/payment/entities/payment.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProductType } from './product-type.entity';

@Entity()
export class Product extends ParentEntity {
  @ManyToOne(
    () => ProductType,
    (product_type: ProductType) => product_type.product,
  )
  product_type: ProductType;

  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'varchar', length: 255 })
  supplier: string;

  @Column('decimal', {
    name: 'price',
    precision: 10,
    scale: 4,
    nullable: false,
  })
  price: number;

  @Column({ type: 'varchar' })
  photo: string;

  @OneToOne(() => Inventory, (inventory: Inventory) => inventory.product)
  @JoinColumn()
  inventory: Inventory;

  @OneToMany(
    () => PaymentDetail,
    (payment_detail: PaymentDetail) => payment_detail.product,
  )
  product_details: PaymentDetail[];
}
