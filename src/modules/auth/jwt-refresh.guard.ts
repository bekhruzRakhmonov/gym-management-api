import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UserService } from 'src/modules/user/user.service';
import { AuthService } from './auth.service';
import RequestWithUser from './requestWithUser.interface';

@Injectable()
export default class JwtRefreshGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    // const cookies = {};
    // const rawCookies = request.headers.cookie.split(' ');
    // for (const cookie of rawCookies) {
    //   const [key, value] = cookie.split('=');
    //   cookies[key] = value;
    // }

    // const refreshToken = cookies['Refresh'];
    const refreshToken: any = request.headers['refresh'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token not found from header');
    }
    const payload = await this.authService.getUserFromUnuthenticatedToken(
      refreshToken,
    );
    request.user = await this.userService.findOne(payload.userId);
    return this.userService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );
  }
}
