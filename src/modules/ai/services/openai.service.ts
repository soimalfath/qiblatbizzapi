import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IAiProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAiService implements IAiProvider {
  private readonly _logger = new Logger(OpenAiService.name);
  private readonly _apiKey: string;
  private readonly _baseUrl: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _configService: ConfigService,
  ) {
    this._apiKey = this._configService.get('OPENAI_API_KEY');
    this._baseUrl = this._configService.get('OPENAI_BASE_URL');
  }

  /**
   * Generates content using the OpenAI API (Not Implemented).
   * @param prompt The prompt text for the AI.
   * @returns A Promise that rejects with a 'Not Implemented' error.
   * @throws {HttpException} Always throws a 'Not Implemented' error.
   */
  async generateContent(prompt: string): Promise<any> {
    this._logger.warn(
      `Generating content with OpenAI for prompt: ${prompt} - NOT IMPLEMENTED`,
    );
    throw new HttpException(
      'OpenAI Service not implemented yet.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}
