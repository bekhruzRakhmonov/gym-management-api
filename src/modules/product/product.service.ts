import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, UpdateResult } from 'typeorm';
import { CreateProductDto } from './dto/product/create-product.dto';
import { ProductPaginationDto } from './dto/product/pagination.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { ProductType } from './entities/product-type.entity';
import { Product } from './entities/product.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductType)
    private readonly productTypeRepo: Repository<ProductType>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}
  async create(
    createProductDto: CreateProductDto,
    moderator_id: number,
  ): Promise<Product> {
    const { product_type_id, ...rest } = createProductDto;
    const product_type = await this.productTypeRepo.findOneBy({
      id: product_type_id,
    });
    const newProduct = this.productRepo.create({ product_type, ...rest });
    newProduct.moderator_id = moderator_id;

    const product = await this.productRepo.save(newProduct);
    const inventory = this.inventoryRepo.create({
      product,
      quantity: 0,
      moderator_id,
    });
    await inventory.save();
    return product;
  }

  async findAll(query?: ProductPaginationDto): Promise<PaginationResponse> {
    const total = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndMapOne(
        'product.productType',
        ProductType,
        'product_type',
        'product.productTypeId = product_type.id',
      )
      .leftJoinAndMapOne(
        'product.inventory',
        Inventory,
        'inventory',
        'product.inventoryId = inventory.id',
      )
      .where(
        '(product.product_name LIKE :query OR product.supplier LIKE :query OR product_type.name LIKE :query)',
      )
      .andWhere('product.status IN (:...statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('product.inventoryId = inventory.id')
      .andWhere('inventory.status = :status', { status: 'active' })
      .setParameter('query', `%${query?.q || ''}%`)
      .getCount();

    const result = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndMapOne(
        'product.productType',
        ProductType,
        'product_type',
        'product.productTypeId = product_type.id',
      )
      .leftJoinAndMapOne(
        'product.inventory',
        Inventory,
        'inventory',
        'product.inventoryId = inventory.id',
      )
      .select([
        'product.id AS id',
        'product.product_name AS product_name',
        'product.price AS price',
        'product.photo AS photo',
        'product.supplier AS supplier',
        'product_type.name AS product_type',
        'product_type.id AS product_type_id',
        'inventory.quantity AS quantity',
      ])
      .where(
        '(product.product_name LIKE :query OR product.supplier LIKE :query OR product_type.name LIKE :query)',
      )
      .andWhere('product.status IN (:...statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('product.inventoryId = inventory.id')
      .andWhere('inventory.status = :status', { status: 'active' })
      .orderBy('product.id', 'DESC')
      .take(query?.limit || 10)
      .skip((query?.limit || 10) * ((query?.page || 1) - 1))
      .setParameter('query', `%${query?.q || ''}%`)
      .getRawMany();

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async findOne(id: number): Promise<Product> {
    return await this.productRepo.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    moderator_id: number,
  ): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: {
        id,
        status: 'active' || 'inactive',
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    const { product_type_id, ...rest } = updateProductDto;
    const product_type = await this.productTypeRepo.findOne({
      where: { id: product_type_id },
    });
    if (!product_type) {
      throw new NotFoundException('Product Type not found.');
    }
    await this.productRepo.update(id, {
      product_type,
      ...rest,
      moderator_id,
      id: id,
    });
    return await this.productRepo.findOneBy({ id });
  }

  async remove(id: number, moderator_id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: {
        id,
        status: 'active' || 'inactive',
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.moderator_id = moderator_id;
    return await this.productRepo.remove(product);
  }
}
