import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { ResponseHelper } from '../../utils/response.helper';
import { RefreshTokenGuard } from './guards/refresh-auth.guard';
import { ConfigService } from '@nestjs/config';
import { RegisterManualUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/base-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { UserEntity } from '../users/entities/user.entity';
import {
  ResetPasswordDto,
  ConfirmResetPasswordDto,
} from './dto/forgot-password.dto';

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
      this.setAccessTokenCookie(res, access_token);
    } catch (error) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return res
          .status(status)
          .json(ResponseHelper.error(error.message, status));
      }
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
      this.setAccessTokenCookie(res, access_token);
      return res.json({ access_token });
    } catch (error) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return res
          .status(status)
          .json(ResponseHelper.error(error.message, status));
      }
      console.error('Token refresh error:', error);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(ResponseHelper.error(error.response.message, 401));
    }
  }
  @Post('register')
  async register(@Body() registeruser: RegisterManualUserDto) {
    try {
      await this.authService.registerManualUser(registeruser);
      return ResponseHelper.success('register user succes');
    } catch (error) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return ResponseHelper.error(error.message, status);
      }
      return ResponseHelper.error(error.response?.message, 401);
    }
  }

  @Post('verify/email')
  async verifEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    try {
      await this.authService.verifyEmail(confirmEmailDto.token);
      return ResponseHelper.success('succes verified email');
    } catch (error) {
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return ResponseHelper.error(error.message, status);
      }
      return ResponseHelper.error(error.response?.message, 401);
    }
  }

  @Post('request/verify')
  async requestVerifEmail(@Req() req: Request): Promise<void> {
    try {
      const user = req.user as UserEntity;
      await this.authService.sendVerificationEmail(user);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Gagal mengirim email verifikasi',
      );
    }
  }

  @Post('login')
  async login(@Body() userLogin: LoginDto, @Res() res: Response) {
    try {
      const { access_token, refresh_token } =
        await this.authService.login(userLogin);
      this.setRefreshTokenCookie(res, refresh_token);
      this.setAccessTokenCookie(res, access_token);
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Login Success'));
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        const status = error.getStatus();
        return res
          .status(status)
          .json(ResponseHelper.error(error.message, status));
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          ResponseHelper.error(error.message || 'Internal Server Error', 500),
        );
    }
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Res() res: Response) {
    this.clearRefreshTokenCookie(res);
    this.clearAccessTokenCookie(res);
    return res.json(ResponseHelper.success('Logged out successfully'));
  }

  @Post('request/reset-password')
  async requestForgotPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.sendEmailForgotPassword(resetPasswordDto.email);
      return ResponseHelper.success('Request reset password successfully');
    } catch (error) {
      const status = error.getStatus();
      return ResponseHelper.error(error.message, status);
    }
  }

  @Post('verify/reset-password')
  async verifyResetPassowrd(
    @Body() confirmResetPasswordDto: ConfirmResetPasswordDto,
  ) {
    try {
      await this.authService.verifyResetPassword(confirmResetPasswordDto);
      return ResponseHelper.success('reset password successfully');
    } catch (error) {
      const status = error.getStatus();
      console.log(error.message);
      return ResponseHelper.error(error.message, status);
    }
  }

  private setAccessTokenCookie(res: Response, access_token: string) {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: secure,
      domain: secure ? '.qiblat.my.id' : '',
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
      path: '/',
    });
  }

  private setRefreshTokenCookie(res: Response, refresh_token: string) {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: secure,
      sameSite: 'lax',
      domain: secure ? '.qiblat.my.id' : '',
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  private clearRefreshTokenCookie(res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: secure ? '.qiblat.my.id' : '',
      path: '/',
    });
  }
  private clearAccessTokenCookie(res: Response) {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: secure ? '.qiblat.my.id' : '',
      path: '/',
    });
  }
}
