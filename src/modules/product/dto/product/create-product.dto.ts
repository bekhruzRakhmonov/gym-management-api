import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDecimal, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  product_type_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  product_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  supplier: string;

  @ApiProperty({ description: 'Paste link of photo for product' })
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  photo: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;
}
