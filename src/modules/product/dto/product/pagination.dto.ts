import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { BasePaginationDto } from 'src/common/pagination/pagination.dto';

export class ProductPaginationDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: 'Search from query' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  product_type_name?: string;

  @ApiPropertyOptional({ description: 'Filter by `product_name`' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  product_name?: string;

  @ApiPropertyOptional({ description: 'Filter by `product_supplier`' })
  @IsOptional()
  @Type(() => String)
  @IsString()
  product_supplier?: string;
}
