import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';

/**
 * @module CommonModule
 * @description Module untuk fungsionalitas umum dan utilitas.
 */
@Module({
  imports: [
    HttpModule, // Diperlukan untuk CommonService melakukan HTTP requests
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService], // Ekspor jika service ini akan digunakan di module lain
})
export class CommonModule {}
