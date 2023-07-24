import { ParentEntity } from 'src/common/entities/parent.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Inventory extends ParentEntity {
  @OneToOne(() => Product, (product: Product) => product.inventory, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product: Product;

  @Column('int')
  quantity: number;
}
