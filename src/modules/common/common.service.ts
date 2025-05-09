import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { firstValueFrom, map, catchError } from 'rxjs';
import { CountryListItemDto } from './dto/country.dto';

/**
 * @interface RestCountryApiResponseItem
 * @description Interface parsial untuk item dalam respons API restcountries.com.
 * Hanya mencakup field yang kita butuhkan.
 */
interface IRestCountryApiResponseItem {
  name: {
    common: string;
    official: string;
  };
  cca2: string; // Kode negara Alpha-2
  // Tambahkan field lain jika diperlukan di masa depan
}

/**
 * @class CommonService
 * @description Service untuk fungsionalitas umum atau utilitas.
 */
@Injectable()
export class CommonService {
  private readonly _logger = new Logger(CommonService.name);
  private readonly _restCountriesApiUrl = 'https://restcountries.com/v3.1/all';

  constructor(private readonly _httpService: HttpService) {}

  /**
   * @method getCountries
   * @description Mengambil daftar semua negara beserta kode region (Alpha-2).
   * @returns {Promise<CountryListItemDto[]>} Daftar negara yang telah diformat.
   * @throws {HttpException} Jika terjadi kesalahan saat mengambil atau memproses data.
   */
  async getCountries(): Promise<CountryListItemDto[]> {
    this._logger.log('Fetching countries from external API...');
    try {
      const response = await firstValueFrom(
        this._httpService
          .get<IRestCountryApiResponseItem[]>(this._restCountriesApiUrl)
          .pipe(
            map((axiosResponse) =>
              axiosResponse.data.map((country) => ({
                name: country.name.common,
                regionCode: country.cca2,
              })),
            ),
            catchError((error) => {
              this._logger.error(
                `Error fetching countries from ${this._restCountriesApiUrl}: ${error.message}`,
                error.stack,
              );
              let status = HttpStatus.INTERNAL_SERVER_ERROR;
              let message =
                'Failed to fetch country data from external source.';

              if (error.response) {
                status = error.response.status || status;
                message = error.response.data?.message || message;
              }
              throw new HttpException(message, status);
            }),
          ),
      );

      this._logger.log(
        `Successfully fetched and mapped ${response.length} countries.`,
      );
      return response;
    } catch (error) {
      // Menangkap error yang mungkin dilempar dari catchError atau error lain
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException yang sudah ada
      }
      this._logger.error(
        `Unexpected error in getCountries: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'An unexpected error occurred while fetching country data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
