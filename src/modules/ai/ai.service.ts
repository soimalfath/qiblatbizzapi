import { Injectable } from '@nestjs/common';
// import { CreateAiDto } from './dto/create-ai.dto';
// import { UpdateAiDto } from './dto/update-ai.dto';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { Observable, map, tap } from 'rxjs';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly modelAi: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configservice: ConfigService,
  ) {
    this.baseUrl = this.configservice.get('GEMINI_BASE_URL');
    this.apiKey = this.configservice.get('GEMINI_APIKEY');
    this.modelAi = this.configservice.get('GEMINI_MODEL_NAME');
  }

  generateCopyWriting(query: string): Observable<any> {
    const data = {
      contents: [
        {
          parts: [
            {
              text: query,
            },
          ],
        },
      ],
    };
    const headers: AxiosRequestConfig['headers'] = {
      'Content-Type': 'application/json',
    };
    const url = `${this.baseUrl}${this.modelAi}:generateContent?key=${this.apiKey}`;
    return this.httpService.post(url, data, { headers }).pipe(
      map((response) => response.data.candidates[0].content.parts[0]),
      tap((data) => console.log('Generated content:', data)),
      catchError((error) => {
        console.error(
          'Error generating content:',
          error.response?.data || error.message,
        );
        return throwError(() => new Error('Failed to generate content'));
      }),
    );
  }

  async create() {
    return 'This action adds a new ai';
  }

  findAll() {
    return `This action returns all ai`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ai`;
  }

  update(id: number) {
    return `This action updates a #${id} ai`;
  }

  remove(id: number) {
    return `This action removes a #${id} ai`;
  }
}
