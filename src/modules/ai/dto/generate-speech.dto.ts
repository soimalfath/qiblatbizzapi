import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO untuk request pembuatan speech menggunakan ElevenLabs.
 */
export class GenerateSpeechDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  @IsString()
  modelId?: string;
}
