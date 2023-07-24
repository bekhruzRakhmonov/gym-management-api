import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsDate,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Term } from '../../membership_types/enums/term.enum';

export class CreateMembershipDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  membership_type_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  member_id: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsIn(['credit_card', 'cash'])
  payment_method: 'credit_card' | 'cash';
}
