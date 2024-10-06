import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './../../config/jwt.config';
import { DatabaseModule } from 'src/database/database.module';
import databaseConfig from 'src/config/database.config';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
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
      global: false, // You may not want this globally available for all
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
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
  exports: [AuthService, DatabaseModule], // Export AuthService jika diperlukan di modul lain
})
export class AuthModule {}