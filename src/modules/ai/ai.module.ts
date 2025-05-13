import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; // Ensure ConfigModule is imported if used by services

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './services/gemini.service';
import { ElevenLabsService } from './services/elevenlabs.service'; // <-- Import
import { AiProviderFactory } from './factories/ai-provider.factory';
import { ProductsModule } from '../products/products.module'; // If ProductsService is used

@Module({
  imports: [
    HttpModule,
    ConfigModule, // Make sure ConfigModule is available if services depend on ConfigService
    ProductsModule, // If ProductsService is injected into AiController or AiService
  ],
  controllers: [AiController],
  providers: [
    AiService,
    GeminiService,
    ElevenLabsService, // <-- Provide ElevenLabsService
    AiProviderFactory,
  ],
  exports: [AiService, AiProviderFactory], // Export if needed by other modules
})
export class AiModule {}
