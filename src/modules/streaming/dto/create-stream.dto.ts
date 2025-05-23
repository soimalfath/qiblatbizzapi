import {
  IsString,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export enum EVideoSourceType {
  FILE = 'file',
  URL = 'url',
}

/**
 * @class CreateStreamDto
 * @description DTO untuk membuat sesi streaming baru.
 */
export class CreateStreamDto {
  @IsEnum(EVideoSourceType)
  sourceType: EVideoSourceType;

  @ValidateIf((o) => o.sourceType === EVideoSourceType.FILE)
  @IsString()
  @ValidateIf((o) => o.sourceType === EVideoSourceType.URL)
  @IsUrl()
  videoSource: string;

  @IsUrl()
  rtmpUrl: string;

  @IsOptional()
  @IsBoolean()
  loop?: boolean;
}
