import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class CreateMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  @IsPhoneNumber('UZ')
  phone: string;

  @ApiProperty({ enum: ['male', 'female'] })
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  @IsIn(['male', 'female'])
  gender: Gender;

  // @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  membership_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_of_birth: Date;
}
