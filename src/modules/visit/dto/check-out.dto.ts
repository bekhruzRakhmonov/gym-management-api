import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckOutDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  member_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  code: string;
}
