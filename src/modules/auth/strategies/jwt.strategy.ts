import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from '../../../config/jwt.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export type JwtPayload = {
  sub: string;
  email: string;
  role: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    const extractJwtFromCookie = (req: any) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    };

    super({
      ignoreExpiration: false,
      secretOrKey: configService.jwt.secret,
      jwtFromRequest: extractJwtFromCookie,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { email: payload.email },
    });
    if (!user) throw new UnauthorizedException('Please log in to continue');
    if (!user.isConfirmed)
      throw new ForbiddenException('Please verify your email to continue');

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
