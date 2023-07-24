import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/modules/product/entities/product.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryPaginationDto } from './dto/pagination.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Inventory } from './entities/inventory.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { ProductType } from '../product/entities/product-type.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}
  async create(
    createInventoryDto: CreateInventoryDto,
    moderator_id: number,
  ): Promise<Inventory> {
    const { product_id, quantity } = createInventoryDto;
    const product = await this.productRepo.findOne({
      where: { id: product_id },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const hasAlreadyCreated = await this.inventoryRepo.findOne({
      where: {
        product: {
          id: product_id,
        },
      },
    });
    if (hasAlreadyCreated) {
      throw new BadRequestException(
        'Inventory for this Product has already created.',
      );
    }
    const newInventory = this.inventoryRepo.create({
      product,
      quantity,
      moderator_id,
    });
    return await this.inventoryRepo.save(newInventory);
  }

  async findAll(query?: InventoryPaginationDto): Promise<PaginationResponse> {
    const total = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoin(
        'inventory.product',
        'product',
        'product.inventoryId = inventory.id',
      )
      .leftJoin(
        'product.product_type',
        'product_type',
        'product.productTypeId = product_type.id',
      )
      .where(
        '(product.product_name LIKE :query OR product.supplier LIKE :query OR product_type.name LIKE :query)',
      )
      .andWhere('product.status IN (:...statuses)', {
        statuses: ['active', 'inactive'],
      })
      .andWhere('product.inventoryId = inventory.id')
      .setParameter('query', `%${query?.q || ''}%`)
      .getCount();

    const result = await this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoin(
        'inventory.product',
        'product',
        'product.inventoryId = inventory.id',
      )
      .leftJoin(
        'product.product_type',
        'product_type',
        'product.productTypeId = product_type.id',
      )
      .select('inventory.id', 'id')
      .addSelect('inventory.status', 'status')
      .addSelect('inventory.created_at', 'created_at')
      .addSelect('inventory.updated_at', 'updated_at')
      .addSelect('inventory.quantity', 'quantity')
      .addSelect('product_type.name', 'product_type')
      .addSelect('product.id', 'product_id')
      .addSelect('product.supplier', 'supplier')
      .addSelect('product.product_name', 'product_name')
      .where(
        '(product.product_name LIKE :query OR product.supplier LIKE :query OR product_type.name LIKE :query)',
      )
      .andWhere('product.status IN (:...statuses)', {
        statuses: ['active', 'inactive'],
      })
      .orderBy('inventory.id', 'DESC')
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
  async findAllProducts(): Promise<any[]> {
    const result = await this.productRepo
      .createQueryBuilder('product')
      .select(['product.id AS id', 'product.product_name AS product_name'])
      .andWhere('product.status IN (:...statuses)', {
        statuses: ['active', 'inactive'],
      })
      .orderBy('product.id', 'DESC')
      .getRawMany();

    return result;
  }

  async findOne(id: number, detail = true): Promise<Inventory> {
    const found = await this.inventoryRepo.findOne({
      where: { id },
      relations: { product: detail },
    });
    if (!found) {
      throw new NotFoundException('Inventory not found.');
    }
    return found;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    moderator_id: number,
  ): Promise<UpdateResult> {
    const found = await this.inventoryRepo.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException('Inventory not found.');
    }
    return await this.inventoryRepo.update(id, {
      id: id,
      quantity: updateInventoryDto.quantity,
      moderator_id: moderator_id,
    });
  }

  async remove(id: number, moderator_id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    inventory.moderator_id = moderator_id;
    return await this.inventoryRepo.remove(inventory);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findOne(id);
    return await this.inventoryRepo.delete(id);
  }
}
