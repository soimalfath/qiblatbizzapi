import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';
import geminiConfiguration from '../../../config/gemini.config';
import { map, catchError, firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { IAiProvider } from '../interfaces/ai-provider.interface';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Service for interacting with Google Gemini AI API
 */
@Injectable()
export class GeminiService implements IAiProvider {
  private readonly _logger = new Logger(GeminiService.name);
  private readonly _apiKey: string;
  private readonly _baseUrl: string;
  private readonly _modelAi: string;

  /**
   * Creates an instance of GeminiService
   * @param _httpService HttpService instance
   * @param _gemConfig Injected Gemini configuration
   */
  constructor(
    private readonly _httpService: HttpService,
    @Inject(geminiConfiguration.KEY)
    private readonly _gemConfig: ConfigType<typeof geminiConfiguration>,
  ) {
    this._baseUrl = this._gemConfig.baseUrl;
    this._apiKey = this._gemConfig.apiKey;
    this._modelAi = this._gemConfig.modelAi;
  }

  /**
   * Generates content using Google Gemini API
   * @param prompt Text prompt for the AI
   * @returns Promise containing parsed response object
   * @throws HttpException when API call fails or response parsing fails
   */
  async generateContent(prompt: string): Promise<any> {
    const data = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    };

    const headers: AxiosRequestConfig['headers'] = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    };

    const url = `${this._baseUrl}${this._modelAi}:generateContent?key=${this._apiKey}`;

    this._logger.debug(`Sending request to Gemini API: ${url}`);
    this._logger.debug(`Request body: ${JSON.stringify(data)}`);

    try {
      const result = await firstValueFrom(
        this._httpService.post<any>(url, data, { headers }).pipe(
          map((response) => {
            this._logger.debug(
              `Raw response from Gemini API: ${JSON.stringify(response.data)}`,
            );

            const textContent =
              response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (typeof textContent !== 'string') {
              this._logger.error(
                'Unexpected response structure from Gemini API',
                JSON.stringify(response.data),
              );
              throw new HttpException(
                'Unexpected response structure from Gemini API',
                HttpStatus.BAD_GATEWAY,
              );
            }

            this._logger.log('Successfully extracted text content from Gemini');

            try {
              const cleanedText = textContent.replace(/^```json\s*|```$/g, '');
              const parsedObject = JSON.parse(cleanedText);
              this._logger.log('Successfully parsed JSON from text response');
              return parsedObject;
            } catch (parseError) {
              this._logger.error(
                'Failed to parse JSON from Gemini response:',
                parseError.message,
                `Original text: ${textContent}`,
              );
              throw new HttpException(
                'Failed to parse JSON response from AI',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
          }),
          catchError((error) => {
            this._logger.error(
              'Error calling Gemini API:',
              error.response?.data || error.message,
              error.stack,
            );
            throw new HttpException(
              error.response?.data?.error?.message ||
                'Failed to contact Gemini API',
              error.response?.status || HttpStatus.BAD_GATEWAY,
            );
          }),
        ),
      );
      return result;
    } catch (error) {
      this._logger.error('Error in generateContent after API call:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal error while processing AI request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
