import { ParentEntity } from 'src/common/entities/parent.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductType extends ParentEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @OneToMany(() => Product, (product: Product) => product.product_type, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product: Product[];
}
