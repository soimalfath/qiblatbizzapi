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

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, AiModule, MailModule],
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
