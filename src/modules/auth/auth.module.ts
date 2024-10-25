import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './../../config/jwt.config';
import { DatabaseModule } from './../../database/database.module';
import databaseConfig from './../../config/database.config';
import { MailService } from '../mailer/mailer.service';
import { MailModule } from '../mailer/mailer.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    MailModule,
    TypeOrmModule.forFeature([UserEntity]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    ConfigModule.forFeature(config),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('config.jwt.secret'),
        signOptions: { expiresIn: configService.get('config.jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('config.refresh.secret'),
        signOptions: {
          expiresIn: configService.get('config.refresh.expiresIn'),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    MailService,
    {
      provide: 'ACCESS_TOKEN_SERVICE',
      useExisting: JwtService,
    },
    {
      provide: 'REFRESH_TOKEN_SERVICE',
      useFactory: async (configService: ConfigService) => {
        const jwtService = new JwtService({
          secret: configService.get('config.refresh.secret'),
          signOptions: {
            expiresIn: configService.get('config.refresh.expiresIn'),
          },
        });
        return jwtService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, DatabaseModule],
})
export class AuthModule {}
