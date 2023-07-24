import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  HttpCode,
  Req,
  Body,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { APIResponse } from 'src/common/http/response/response.api';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from './auth.service';
import JwtAuthGuard from './jwt-auth.guard';
import RequestWithUser from './requestWithUser.interface';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(200)
  @Post('login')
  async logIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // const hostname = req.headers.host.split(':')[0];
    const { username, password } = loginDto;
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new BadRequestException('Username or password is wrong');
    }
    const refreshToken = this.authService.getJwtRefreshToken(
      user.id,
      user.role,
    );

    const accessToken = this.authService.getJwtAccessToken(user.id, user.role);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    const {
      moderator_id,
      action_message,
      created_at,
      updated_at,
      currentHashedRefreshToken,
      ...userData
    } = user;
    return { accessToken, refreshToken, user: userData };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logOut(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      await this.userService.removeRefreshToken(req.user.id);
      APIResponse(res).statusOK();
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    return request.user;
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    const user = await this.authService.getUserFromUnuthenticatedToken(
      refreshToken,
    );
    const accessToken = this.authService.getJwtAccessToken(
      user.userId,
      user.role,
    );
    return { accessToken };
  }
}
