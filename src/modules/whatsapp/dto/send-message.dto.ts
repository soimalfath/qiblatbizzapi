import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  to: string; // Nomor tujuan, contoh: '6281234567890'

  @IsString()
  @IsNotEmpty()
  message: string;
}
