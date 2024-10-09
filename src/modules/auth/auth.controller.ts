import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { ResponseHelper } from '../../utils/response.helper';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {}

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { access_token, refresh_token } = await this.authService.signIn(
        req.user,
      );

      this.setRefreshTokenCookie(res, refresh_token);

      const callbackURL = this.configService.get('FRONT_END_URL');
      return res.redirect(
        `${callbackURL}/auth/callback?access_token=${access_token}`,
      );
    } catch (error) {
      console.error('Google auth callback error:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Internal Server Error', 500));
    }
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    try {
      const { access_token } = await this.authService.refreshTokens(
        req.cookies['refresh_token'],
      );

      return res.json({ access_token });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ResponseHelper.error(error.response.message, 401));
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    this.clearRefreshTokenCookie(res);
    return res.json(ResponseHelper.success('Logged out successfully'));
  }

  private setRefreshTokenCookie(res: Response, refresh_token: string) {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: secure,
      sameSite: 'lax',
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
