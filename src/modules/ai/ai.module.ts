import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from '../products/products.module'; // Correctly imported
import { AiProviderFactory } from './factories/ai-provider.factory'; // Impor Factory
import { GeminiService } from './services/gemini.service'; // Impor GeminiService karena dipakai Factory
import { OpenAiService } from './services/openai.service'; // Impor OpenAiService jika ada dan dipakai Factory

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    ProductsModule, // ProductsModule is listed here
  ],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderFactory,
    GeminiService,
    OpenAiService,
    // ProductsService is not directly provided here, which is fine if imported correctly
  ],
  exports: [AiService, AiProviderFactory],
})
export class AiModule {}
