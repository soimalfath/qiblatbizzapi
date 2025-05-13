// import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * @class GetChannelDetailsParamsDto
 * @description DTO untuk parameter path saat mengambil detail channel YouTube.
 */
export class GetChannelDetailsParamsDto {
  // @ApiProperty({
  //   description: 'ID unik dari channel YouTube.',
  //   example: 'UCBR8-60-B28hp2BmDPdntcQ', // Contoh ID channel YouTube
  // })
  @IsNotEmpty()
  @IsString()
  channel_id: string;
}
