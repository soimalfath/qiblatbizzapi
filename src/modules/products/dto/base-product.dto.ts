import { IsString, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
export class BaseProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  categories: string;

  @IsString()
  sku: string;

  @IsString()
  supplier: string;

  @IsString()
  picture: string;

  @IsString()
  link: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Type(() => Number)
  hpp: number;

  @IsNumber()
  @Type(() => Number)
  stock: number;

  @IsBoolean()
  isActive: boolean;
}
