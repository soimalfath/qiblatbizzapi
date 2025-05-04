/**
 * Mendefinisikan tipe-tipe konten yang didukung
 */
export type ContentType = 'text' | 'image' | 'json';
/**
 * Interface untuk konfigurasi generasi konten
 */
export interface IGenerationConfig {
  temperature?: number;
  top_k?: number;
  top_p?: number;
  max_output_tokens?: number;
  response_mime_type?: string;
}

/**
 * Interface untuk parameter generasi konten
 */
export interface IContentGenerationParams {
  prompt: string;
  content_type: ContentType;
  generation_config?: IGenerationConfig;
  image_data?: string; // Base64 string untuk input gambar
}
