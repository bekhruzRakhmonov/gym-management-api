import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductType } from './entities/product-type.entity';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from './product-type.service';
import { Inventory } from '../inventory/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductType, Inventory])],
  controllers: [ProductController, ProductTypeController],
  providers: [ProductService, ProductTypeService],
})
export class ProductModule {}
