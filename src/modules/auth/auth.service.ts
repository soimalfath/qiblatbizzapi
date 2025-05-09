import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Inject,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateFromEmail } from 'unique-username-generator';
import { UserEntity } from '../users/entities/user.entity';
import {
  RegisterUserDto,
  RegisterManualUserDto,
} from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/base-user.dto';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { MailService } from '../mailer/mailer.service';
import { ConfirmResetPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ACCESS_TOKEN_SERVICE')
    private readonly _accessTokenService: JwtService,
    @Inject('REFRESH_TOKEN_SERVICE')
    private readonly _refreshTokenService: JwtService,
    @InjectRepository(UserEntity)
    private _userRepository: Repository<UserEntity>,
    private _configService: ConfigService,
    private _mailService: MailService,
    private _tokenService: JwtService,
  ) {}

  generateJwt(payload) {
    return this._accessTokenService.sign(payload);
  }

  generateRefresh(payload) {
    return this._refreshTokenService.sign(payload);
  }

  async hashingPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async sendVerificationEmail(user: UserEntity) {
    if (user.isConfirmed) throw new ConflictException('Email already verified');
    const payload = { email: user.email };
    const token = this._tokenService.sign(payload, {
      expiresIn: '1d',
      secret: '.wi7nd.[-',
    });
    const type = 'emailVerification';
    const confirmationUrl = `${this._configService.get<string>('FRONT_END_URL')}/auth/confirm?code=${token}`;
    await this._mailService.sendEmail(
      type,
      user.email,
      user.name,
      confirmationUrl,
    );
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this._accessTokenService.verifyAsync(token, {
        secret: '.wi7nd.[-',
      });

      const user = await this.findUserByEmail(payload.email);
      if (!user) throw new UnauthorizedException('Invalid token');

      user.isConfirmed = true;
      await this._userRepository.update(user.id, { isConfirmed: true });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async registerManualUser(user: RegisterManualUserDto) {
    const userExists = await this.findUserByEmail(user.email);
    if (userExists) throw new ConflictException('Email already in use');
    const newUser = this._userRepository.create(user);
    newUser.name = user.username;
    newUser.password = await this.hashingPassword(user.password);
    await this._userRepository.save(newUser);
    await this.sendVerificationEmail(newUser);
  }

  async login(
    userLogin: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const userExists = await this.findUserByEmail(userLogin.email);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    if (!userExists.isConfirmed)
      throw new ForbiddenException('Please verify your email to continue');

    const isPasswordValid = await this.comparePassword(
      userLogin.password,
      userExists.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this._generateTokens(userExists);
  }

  async signIn(user) {
    if (!user) {
      throw new BadRequestException('Unauthenticated');
    }
    const userExists = await this.findUserByEmail(user.email);

    if (userExists.password) {
      throw new UnauthorizedException('please login using password');
    }

    if (!userExists) {
      return this.registerUser(user);
    }

    return this._generateTokens(userExists);
  }

  async registerUser(user: RegisterUserDto) {
    try {
      const newUser = this._userRepository.create(user);
      newUser.name = generateFromEmail(user.email, 5);
      newUser.isConfirmed = true;
      await this._userRepository.save(newUser);

      return this._generateTokens(newUser);
    } catch (error) {
      console.error('Error in registerUser:', error);
      throw new InternalServerErrorException(
        'Failed to register user: ' + error.message,
      );
    }
  }

  async findUserByEmail(email: string) {
    const user = await this._userRepository.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  private _generateTokens(user: UserEntity) {
    const payload = { sub: user.id, email: user.email, role: [user.role] };

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const access_token = this.generateJwt(payload);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const refresh_token = this.generateRefresh(payload);

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this._refreshTokenService.verifyAsync(
        refreshToken,
        {
          secret: this._configService.get('config.refresh.secret'),
        },
      );
      const user = await this._userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this._generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  async sendEmailForgotPassword(email: string) {
    const userExists = await this.findUserByEmail(email);
    if (!userExists) {
      throw new UnauthorizedException(
        'If your email exists, you will receive instructions',
      );
    }

    const payload = {
      email: userExists.email,
    };
    const type = 'forgotPassword';
    const token = this._tokenService.sign(payload, {
      expiresIn: '6h',
      secret: '737hgh.',
    });
    const username = userExists.name;
    const confirmationUrl = `${this._configService.get<string>('FRONT_END_URL')}/auth/reset-password?code=${token}`;
    await this._mailService.sendEmail(type, email, username, confirmationUrl);
  }

  async verifyResetPassword(resetPassword: ConfirmResetPasswordDto) {
    const payload = await this._tokenService.verify(resetPassword.token, {
      secret: '737hgh.',
    });
    if (!payload) throw new UnauthorizedException('Invalid token');
    const userExists = await this.findUserByEmail(payload.email);
    if (!userExists) throw new UnauthorizedException('User not found');
    const isSameWithOldPassword = await this.comparePassword(
      resetPassword.password,
      userExists.password,
    );
    if (isSameWithOldPassword)
      throw new ForbiddenException(
        'New password cannot be the same as the old password',
      );
    const newPassword = await this.hashingPassword(resetPassword.password);
    await this._userRepository.update(userExists.id, { password: newPassword });
    const urlLogin = `${this._configService.get<string>('FRONT_END_URL')}/auth/signin`;
    const type = 'passwordResetConfirmation';
    await this._mailService.sendEmail(
      type,
      userExists.email,
      userExists.name,
      urlLogin,
    );
  }
}
