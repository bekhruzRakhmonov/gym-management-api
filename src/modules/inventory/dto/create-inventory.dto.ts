import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  product_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}
