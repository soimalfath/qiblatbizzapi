import { Module } from '@nestjs/common';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';

/**
 * @module StreamingModule
 * @description Module untuk mengelola fungsionalitas streaming video.
 */
@Module({
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
