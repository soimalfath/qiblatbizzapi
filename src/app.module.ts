import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AiModule } from './modules/ai/ai.module';
import { MailModule } from './modules/mailer/mailer.module';
import { YoutubeModule } from './modules/youtube/youtube.module'; // Tambahkan impor ini
import { ConfigModule } from '@nestjs/config';
import youtubeConfiguration from './config/youtube.config'; // Impor konfigurasi YouTube
import databaseConfig from './config/database.config';
import config from './config/jwt.config';
import appConfiguration from './config/app.config';
import geminiConfig from './config/gemini.config';
import elevenlabsConfig from './config/elevenlabs.config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    AiModule,
    MailModule,
    YoutubeModule,
    ConfigModule.forRoot({
      isGlobal: true, // Pastikan ConfigModule bersifat global jika belum
      load: [
        databaseConfig,
        config, // Ini adalah jwt.config.ts
        youtubeConfiguration, // Tambahkan ini
        geminiConfig, // Tambahkan ini
        appConfiguration,
        elevenlabsConfig,
      ], // Tambahkan ini], // Tambahkan youtubeConfiguration ke array load
      // ... konfigurasi ConfigModule lainnya jika ada (misalnya validasi schema, envFilePath)
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
