import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async auth() {
    // This will trigger the OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const token = await this.authservice.signIn(req.user);
      // Set the access token as a cookie
      res.cookie('access_token', token, {
        maxAge: 2592000000, // 30 days
        sameSite: 'strict',
        httpOnly: true,
        secure: false, // Should be true in production if using HTTPS
      });

      // Respond with a success status and message
      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
      });
    } catch (error) {
      // Log the error and send an appropriate response
      console.error('Google auth callback error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error',
      });
    }
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
}
