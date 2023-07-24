import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateProductTypeDto } from './dto/product_type/create-product-type.dto';
import { ProductTypePaginationDto } from './dto/product_type/pagination.dto';
import { ProductType } from './entities/product-type.entity';
import { PaginationResponse } from 'src/common/pagination/pagination-response.dto';
import { UpdateProductTypeDto } from './dto/product_type/update-product-type';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepo: Repository<ProductType>,
  ) {}
  async create(
    createProductTypeDto: CreateProductTypeDto,
    moderator_id: number,
  ): Promise<ProductType> {
    const { name } = createProductTypeDto;
    const product_type = await this.productTypeRepo.findOne({
      where: { name },
    });
    if (!product_type) {
      const newProductType = this.productTypeRepo.create({ name });
      newProductType.moderator_id = moderator_id;
      return await this.productTypeRepo.save(newProductType);
    }
  }

  async findAll(query?: ProductTypePaginationDto): Promise<PaginationResponse> {
    const total = await this.productTypeRepo.count();
    const result = await this.productTypeRepo.find({
      where: {
        status: Not('removed'),
      },
      order: { created_at: 'DESC' },
      skip: (query?.limit || 10) * ((query?.page || 1) - 1),
      take: query?.limit || 10,
    });

    return {
      result,
      total,
      limit: Number(query?.limit || 10),
      page: Number(query?.page || 1),
    };
  }

  async remove(id: number, moderator_id: number): Promise<ProductType> {
    const product_type = await this.productTypeRepo.findOne({
      where: { id },
    });
    if (!product_type) {
      throw new NotFoundException('Product Type not found');
    }
    product_type.moderator_id = moderator_id;
    return await this.productTypeRepo.remove(product_type);
  }

  async update(
    id: number,
    updateProductTypeDto: UpdateProductTypeDto,
    moderator_id: number,
  ): Promise<ProductType> {
    const { name } = updateProductTypeDto;
    const product_type = await this.productTypeRepo.findOne({
      where: { id },
    });
    if (!product_type) {
      throw new NotFoundException('Product Type not found.');
    }
    await this.productTypeRepo.update(id, {
      name,
      moderator_id,
      id: id,
    });
    return await this.productTypeRepo.findOneBy({ id });
  }
}
