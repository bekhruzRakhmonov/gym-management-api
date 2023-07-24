import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @ApiProperty()
  refreshToken: string;
}
