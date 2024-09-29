import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
export class BaseProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
