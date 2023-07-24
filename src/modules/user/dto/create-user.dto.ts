import { ApiProperty } from '@nestjs/swagger/dist';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { Role } from 'src/modules/auth/roles/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty({ enum: ['admin', 'manager'] })
  @IsNotEmpty()
  @IsIn(['admin', 'manager'])
  role: 'admin' | 'manager';

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => String)
  @IsString()
  fullname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('UZ')
  phone: string;
}
