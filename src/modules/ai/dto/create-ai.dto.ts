import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
export class CreateAiDto {}
export class GenerateCopywriting {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  productId: number;
}
