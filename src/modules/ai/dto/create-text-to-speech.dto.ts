import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO untuk membuat permintaan text-to-speech.
 */
export class CreateTextToSpeechDto {
  /**
   * Teks yang akan diubah menjadi suara.
   * @example 'Halo, apa kabar?'
   */
  @IsString()
  @IsNotEmpty()
  text: string;

  /**
   * ID suara yang akan digunakan dari ElevenLabs.
   * Jika tidak disediakan, akan menggunakan ID suara default dari konfigurasi.
   * @example '21m00Tcm4TlvDq8ikWAM'
   */
  @IsString()
  @IsOptional()
  voice_id?: string;

  /**
   * ID model yang akan digunakan (misalnya, eleven_multilingual_v2).
   * Jika tidak disediakan, akan menggunakan model default dari konfigurasi.
   * @example 'eleven_multilingual_v2'
   */
  @IsString()
  @IsOptional()
  model_id?: string;

  // Anda dapat menambahkan voice_settings di sini jika diperlukan di masa mendatang
  // @IsOptional()
  // voice_settings?: {
  //   stability?: number;
  //   similarity_boost?: number;
  //   style?: number;
  //   use_speaker_boost?: boolean;
  // };
}
