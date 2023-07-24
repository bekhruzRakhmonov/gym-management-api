import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  name: string;
}
