import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import TokenPayload from './tokenPayload.interface';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/user/entities/user.entity';
import { config } from 'dotenv';
config();

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    plainTextPassword: string,
  ): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.verifyPassword(plainTextPassword, user.password);
    const { password, ...result } = user;
    return result;
  }

  public getJwtAccessToken(userId: number, type: string) {
    const payload: TokenPayload = {
      userId: userId,
      role: type,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}`,
    });
    return token;
  }

  public getJwtRefreshToken(userId: number, type: string) {
    const payload: TokenPayload = {
      userId: userId,
      role: type,
    };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}`,
    });

    return token;
  }

  public async getAuthenticatedUser(
    username: string,
    plainTextPassword: string,
  ) {
    try {
      const user = await this.userService.findByUsername(username);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async getUserFromAuthenticationToken(token: string): Promise<User> {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    });
    if (payload.userId) {
      return this.userService.findOne(payload.userId);
    }
  }

  public async getUserFromUnuthenticatedToken(
    token: string,
  ): Promise<TokenPayload> {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
    });
    return payload;
  }
}
