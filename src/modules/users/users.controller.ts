import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/utils/response.helper';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enum/role.enum';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
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
        role:
          userData.role === 0
            ? 'admin'
            : userData.role === 1
              ? 'user'
              : 'sub-user',
      };
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Get profile success', user));
    } catch (err) {
      console.error('Failed get user profile', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed to get profile', err.message));
    }
  }
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllProfile(@Res() res: Response) {
    try {
      const users = await this.usersService.getAllUser();
      const mappedUsers = users.map((item) => {
        return {
          email: item.email,
          name: item.name,
          picture: item.picture,
          createdAt: item.createdAt,
          updateAt: item.updatedAt,
        };
      });
      return res
        .status(HttpStatus.OK)
        .json(ResponseHelper.success('Get All user success', mappedUsers));
    } catch (err) {
      console.error('Failed get all user profile', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(ResponseHelper.error('Failed to get profile', err.message));
    }
  }
}
