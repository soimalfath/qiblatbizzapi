import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
  Res,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { Response } from 'express';
import { ResponseHelper } from '../../utils/response.helper';
import { CountryListItemDto } from './dto/country.dto';

/**
 * @class CommonController
 * @description Controller untuk endpoint umum atau utilitas.
 */
@Controller('common')
export class CommonController {
  private readonly _logger = new Logger(CommonController.name);

  constructor(private readonly _commonService: CommonService) {}

  /**
   * @method listCountries
   * @description Endpoint untuk mendapatkan daftar semua negara dan kode regionnya.
   * @param {Response} res Objek respons Express.
   * @returns {Promise<Response>} Respons JSON yang berisi daftar negara atau pesan error.
   */
  @Get('countries')
  @HttpCode(HttpStatus.OK)
  async listCountries(@Res() res: Response): Promise<Response> {
    try {
      this._logger.log('Request received for listing countries.');
      const countries: CountryListItemDto[] =
        await this._commonService.getCountries();
      return res.status(HttpStatus.OK).json(
        ResponseHelper.success(
          'Successfully retrieved list of countries',
          { countries }, // Membungkus array dalam objek agar sesuai dengan CountriesResponseDto
        ),
      );
    } catch (error) {
      this._logger.error(
        `Error in listCountries endpoint: ${error.message}`,
        error.stack,
      );
      const statusCode =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof HttpException
          ? error.message
          : 'An unexpected error occurred.';
      return res
        .status(statusCode)
        .json(ResponseHelper.error(message, statusCode));
    }
  }
}
