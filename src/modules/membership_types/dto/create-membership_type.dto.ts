import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Term } from 'src/modules/membership_types/enums/term.enum';

export class CreateMembershipTypeDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsIn([
    Term.OneDay,
    Term.FiftenDay,
    Term.Week,
    Term.OneMonth,
    Term.TwoMonth,
    Term.ThreeMonth,
    Term.FourMonth,
    Term.FiveMonth,
    Term.SixMonth,
  ])
  term: Term;
}
