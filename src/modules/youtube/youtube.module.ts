import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    HttpModule, // HttpModule diperlukan untuk HttpService
    ConfigModule, // ConfigModule diperlukan untuk ConfigService
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService], // Ekspor jika service ini akan digunakan di modul lain
})
export class YoutubeModule {}
