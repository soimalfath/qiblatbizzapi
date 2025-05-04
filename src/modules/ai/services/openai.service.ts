import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'; // Added Logger
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  IAiProvider,
  // IAiProviderResponse, // Removed
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAiService implements IAiProvider {
  private readonly logger = new Logger(OpenAiService.name); // Added logger
  private readonly api_key: string; // Naming convention: snake_case
  private readonly base_url: string; // Naming convention: snake_case

  constructor(
    private readonly http_service: HttpService, // Naming convention: snake_case
    private readonly config_service: ConfigService, // Naming convention: snake_case
  ) {
    this.api_key = this.config_service.get('OPENAI_API_KEY');
    this.base_url = this.config_service.get('OPENAI_BASE_URL');
  }

  /**
   * Generates content using the OpenAI API (Not Implemented).
   * @param prompt The prompt text for the AI.
   * @returns A Promise that rejects with a 'Not Implemented' error.
   * @throws {HttpException} Always throws a 'Not Implemented' error.
   */
  async generate_content(prompt: string): Promise<any> {
    // Naming convention: snake_case, return type Promise<any>
    this.logger.warn(
      `Generating content with OpenAI for prompt: ${prompt} - NOT IMPLEMENTED`,
    );
    // Ganti dengan implementasi nyata
    throw new HttpException(
      'OpenAI Service not implemented yet.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
