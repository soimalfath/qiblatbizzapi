import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateFromEmail } from 'unique-username-generator';
import { UserEntity } from '../users/entities/user.entity';
import { RegisterUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly accessTokenService: JwtService,
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  generateJwt(payload: any) {
    return this.accessTokenService.sign(payload);
  }

  generateRefresh(payload) {
    return this.refreshTokenService.sign(payload);
  }

  async signIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }
    const userExists = await this.findUserByEmail(user.email);

    if (!userExists) {
      return this.registerUser(user);
    }

    return this.generateTokens(userExists);
  }

  async registerUser(user: RegisterUserDto) {
    try {
      const newUser = this.userRepository.create(user);
      newUser.name = generateFromEmail(user.email, 5);
      await this.userRepository.save(newUser);

      return this.generateTokens(newUser);
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw new InternalServerErrorException(
        'Failed to register user: ' + error.message,
      );
    }
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  private generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const access_token = this.generateJwt(payload);
    const refresh_token = this.generateRefresh(payload);

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.refreshTokenService.verifyAsync(refreshToken, {
        secret: this.configService.get('config.refresh.secret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateRefreshToken(refreshToken: string) {
    try {
      const payload = await this.refreshTokenService.verifyAsync(refreshToken, {
        secret: this.configService.get('config.refresh.secret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
