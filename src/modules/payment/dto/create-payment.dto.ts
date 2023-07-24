import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

interface ProductsType {}

export class CreatePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsIn(['credit_card', 'cash'])
  payment_method: 'credit_card' | 'cash';

  @ApiProperty({ description: '`membership` || `products`' })
  @IsNotEmpty()
  @Type(() => String)
  @IsIn(['membership', 'products'])
  for_what: 'membership' | 'products';

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsIn(['unpaid', 'paid'])
  paid_status: 'unpaid' | 'paid';

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  member_id: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Array)
  @IsArray()
  products: { product_id: number; product_count: number }[];
}
