// import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
// import { firstValueFrom, map, catchError } from 'rxjs'; // Dihapus karena tidak lagi menggunakan HttpService
import { CountryListItemDto } from './dto/country.dto';
// Impor konstanta 'countries' dari file country.ts
import { countries as countryData } from './country';

// Interface ICountryData tidak lagi diperlukan karena kita mengimpor array yang sudah diketik
// interface ICountryData {
//   countries: CountryListItemDto[];
// }

/**
 * @class CommonService
 * @description Service untuk fungsionalitas umum atau utilitas.
 */
@Injectable()
export class CommonService {
  private readonly _logger = new Logger(CommonService.name);

  constructor() {}

  /**
   * @method getCountries
   * @description Mengambil daftar semua negara beserta kode region (Alpha-2) dari konstanta lokal.
   * @returns {Promise<CountryListItemDto[]>} Daftar negara yang telah diformat.
   * @throws {HttpException} Jika terjadi kesalahan saat memproses data (seharusnya minimal dengan data statis).
   */
  async getCountries(): Promise<CountryListItemDto[]> {
    this._logger.log('Fetching countries from local constant...');
    try {
      // Langsung gunakan data yang sudah diimpor
      // countryData adalah array CountryListItemDto[]
      if (!countryData || !Array.isArray(countryData)) {
        // Pemeriksaan ini mungkin berlebihan jika country.ts selalu mengekspor array yang valid
        this._logger.error(
          'Country data is not loaded correctly or is not an array.',
        );
        throw new HttpException(
          'Failed to load country data due to an internal issue.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (countryData.length === 0) {
        this._logger.warn('No countries found in the local data source.');
      }

      this._logger.log(
        `Successfully fetched ${countryData.length} countries from local constant.`,
      );
      return countryData; // Kembalikan array langsung
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this._logger.error(
        `Error processing countries from local constant: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'An unexpected error occurred while fetching country data.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
