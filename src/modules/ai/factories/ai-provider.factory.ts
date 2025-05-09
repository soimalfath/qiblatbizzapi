import { Injectable, Logger } from '@nestjs/common';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { GeminiService } from '../services/gemini.service';
import { ElevenLabsService } from '../services/elevenlabs.service'; // <-- Make sure this is imported

/**
 * Defines the types of AI providers available.
 * Add new provider types here.
 */
export type AiProviderType = 'gemini' | 'elevenlabs'; // <-- Add 'elevenlabs' if not present

/**
 * Factory class for creating instances of AI providers.
 * This allows for easy swapping and management of different AI service integrations.
 */
@Injectable()
export class AiProviderFactory {
  private readonly _logger = new Logger(AiProviderFactory.name);

  constructor(
    private readonly _geminiService: GeminiService,
    private readonly _elevenLabsService: ElevenLabsService, // <-- Inject ElevenLabsService
  ) {}

  /**
   * Retrieves an AI provider instance based on the specified type.
   * @param type The type of AI provider to retrieve ('gemini', 'elevenlabs', etc.).
   * @returns An instance of the AI provider.
   * @throws Error if the provider type is not supported.
   */
  getProvider(type: AiProviderType): IAiProvider {
    this._logger.log(`Requesting AI provider of type: ${type}`);
    switch (type) {
      case 'gemini':
        this._logger.log('Returning GeminiService instance.');
        return this._geminiService;
      case 'elevenlabs': // <-- Add this case
        this._logger.log('Returning ElevenLabsService instance.');
        return this._elevenLabsService;
      default:
        this._logger.error(`AI provider "${type}" not supported.`);
        // The following line ensures that 'type' is never, which is a good practice for exhaustiveness checking.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _exhaustiveCheck: never = type;
        throw new Error(`AI provider "${type}" not supported.`);
    }
  }
}
