/**
 * @class CountryListItemDto
 * @description DTO untuk satu item negara dalam daftar.
 */
export class CountryListItemDto {
  name: string;

  regionCode: string; // Ini akan diambil dari 'cca2' pada respons API
}

/**
 * @class CountriesResponseDto
 * @description DTO untuk respons daftar negara.
 */
export class CountriesResponseDto {
  countries: CountryListItemDto[];
}
