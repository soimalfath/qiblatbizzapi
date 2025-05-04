import { Injectable, Logger } from '@nestjs/common'; // Added Logger
import {
  IAiProvider, // Renamed import alias for clarity if needed, but IAiProvider is fine
  // IAiProviderResponse, // No longer needed here
} from '../interfaces/ai-provider.interface';
import { GeminiService } from '../services/gemini.service';
import { OpenAiService } from '../services/openai.service';
// Removed unused rxjs imports
// import { from as rxFrom } from 'rxjs';
// import { map } from 'rxjs/operators';
// Import service provider lain di sini

export type AiProviderType = 'gemini' | 'openai'; // Removed other types for now

@Injectable()
export class AiProviderFactory {
  private readonly logger = new Logger(AiProviderFactory.name); // Added logger

  constructor(
    // Inject semua service provider AI
    private readonly geminiService: GeminiService,
    private readonly openAiService: OpenAiService,
    // Inject service lain di sini
  ) {}

  /**
   * Retrieves the appropriate AI provider service based on the requested type.
   * @param providerName The type of AI provider requested.
   * @returns The AI provider service instance.
   * @throws {Error} If the requested provider is not supported.
   */
  getProvider(providerName: AiProviderType): IAiProvider {
    this.logger.log(`Getting AI provider for type: ${providerName}`);
    switch (providerName.toLowerCase()) {
      case 'gemini':
        // GeminiService already implements IAiProvider
        return this.geminiService;
      case 'openai':
        // OpenAiService already implements IAiProvider
        return this.openAiService;
      // Tambahkan case untuk provider lain
      // case 'deepseek':
      //   return this.deepSeekService;
      default:
        // Handle unsupported providers explicitly
        this.logger.error(`AI provider "${providerName}" not supported.`);
        // Option 1: Throw an error
        throw new Error(`AI provider "${providerName}" not supported.`);
      // Option 2: Default to a provider (less recommended unless intended)
      // console.warn(
      //   `AI provider "${providerName}" not found or not implemented, defaulting to Gemini.`,
      // );
      // return this.geminiService;
    }
  }
}

// Removed the conflicting local 'from' function definition
// function from(arg0: Promise<IAiProviderResponse>) {
//   throw new Error('Function not implemented.');
// }
