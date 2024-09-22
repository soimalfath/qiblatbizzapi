import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/utils/response.helper';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.user['id'];
      const userData = await this.usersService.getUserProfile(userId);
      const user = {
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        createdAt: userData.createdAt,
        updateAt: userData.updatedAt,
      };
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('get profile success', user));
    } catch (err) {
      console.error('failed get user profile', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed to get profile', err.message));
    }
  }
}
