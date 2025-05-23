/**
 * @file country.ts
 * @description Daftar negara beserta kode region (Alpha-2).
 * Data ini diekspor sebagai constant array untuk digunakan di seluruh aplikasi.
 */

import { CountryListItemDto } from './dto/country.dto'; // Pastikan path ini benar

/**
 * @const countries
 * @description Array yang berisi daftar negara dan kode regionnya.
 * Setiap objek dalam array sesuai dengan CountryListItemDto.
 */
export const countries: CountryListItemDto[] = [
  { name: 'Afganistan', regionCode: 'AF' },
  { name: 'Albania', regionCode: 'AL' },
  { name: 'Aljazair', regionCode: 'DZ' },
  { name: 'Andorra', regionCode: 'AD' },
  { name: 'Angola', regionCode: 'AO' },
  { name: 'Antigua dan Barbuda', regionCode: 'AG' },
  { name: 'Argentina', regionCode: 'AR' },
  { name: 'Armenia', regionCode: 'AM' },
  { name: 'Australia', regionCode: 'AU' },
  { name: 'Austria', regionCode: 'AT' },
  { name: 'Azerbaijan', regionCode: 'AZ' },
  { name: 'Bahama', regionCode: 'BS' },
  { name: 'Bahrain', regionCode: 'BH' },
  { name: 'Bangladesh', regionCode: 'BD' },
  { name: 'Barbados', regionCode: 'BB' },
  { name: 'Belarus', regionCode: 'BY' },
  { name: 'Belgia', regionCode: 'BE' },
  { name: 'Belize', regionCode: 'BZ' },
  { name: 'Benin', regionCode: 'BJ' },
  { name: 'Bhutan', regionCode: 'BT' },
  { name: 'Bolivia', regionCode: 'BO' },
  { name: 'Bosnia dan Herzegovina', regionCode: 'BA' },
  { name: 'Botswana', regionCode: 'BW' },
  { name: 'Brasil', regionCode: 'BR' },
  { name: 'Brunei', regionCode: 'BN' },
  { name: 'Bulgaria', regionCode: 'BG' },
  { name: 'Burkina Faso', regionCode: 'BF' },
  { name: 'Burundi', regionCode: 'BI' },
  { name: 'Cabo Verde', regionCode: 'CV' },
  { name: 'Kamboja', regionCode: 'KH' },
  { name: 'Kamerun', regionCode: 'CM' },
  { name: 'Kanada', regionCode: 'CA' },
  { name: 'Republik Afrika Tengah', regionCode: 'CF' },
  { name: 'Chad', regionCode: 'TD' },
  { name: 'Chili', regionCode: 'CL' },
  { name: 'Kolombia', regionCode: 'CO' },
  { name: 'Komoro', regionCode: 'KM' },
  { name: 'Republik Demokratik Kongo', regionCode: 'CD' },
  { name: 'Republik Kongo', regionCode: 'CG' },
  { name: 'Kosta Rika', regionCode: 'CR' },
  { name: 'Pantai Gading', regionCode: 'CI' },
  { name: 'Kroasia', regionCode: 'HR' },
  { name: 'Kuba', regionCode: 'CU' },
  { name: 'Siprus', regionCode: 'CY' },
  { name: 'Ceko', regionCode: 'CZ' },
  { name: 'Denmark', regionCode: 'DK' },
  { name: 'Djibouti', regionCode: 'DJ' },
  { name: 'Dominika', regionCode: 'DM' },
  { name: 'Republik Dominika', regionCode: 'DO' },
  { name: 'Ekuador', regionCode: 'EC' },
  { name: 'Mesir', regionCode: 'EG' },
  { name: 'El Salvador', regionCode: 'SV' },
  { name: 'Guinea Khatulistiwa', regionCode: 'GQ' },
  { name: 'Eritrea', regionCode: 'ER' },
  { name: 'Estonia', regionCode: 'EE' },
  { name: 'Eswatini', regionCode: 'SZ' },
  { name: 'Etiopia', regionCode: 'ET' },
  { name: 'Fiji', regionCode: 'FJ' },
  { name: 'Finlandia', regionCode: 'FI' },
  { name: 'Prancis', regionCode: 'FR' },
  { name: 'Gabon', regionCode: 'GA' },
  { name: 'Gambia', regionCode: 'GM' },
  { name: 'Georgia', regionCode: 'GE' },
  { name: 'Jerman', regionCode: 'DE' },
  { name: 'Ghana', regionCode: 'GH' },
  { name: 'Yunani', regionCode: 'GR' },
  { name: 'Grenada', regionCode: 'GD' },
  { name: 'Guatemala', regionCode: 'GT' },
  { name: 'Guinea', regionCode: 'GN' },
  { name: 'Guinea-Bissau', regionCode: 'GW' },
  { name: 'Guyana', regionCode: 'GY' },
  { name: 'Haiti', regionCode: 'HT' },
  { name: 'Honduras', regionCode: 'HN' },
  { name: 'Hongaria', regionCode: 'HU' },
  { name: 'Islandia', regionCode: 'IS' },
  { name: 'India', regionCode: 'IN' },
  { name: 'Indonesia', regionCode: 'ID' },
  { name: 'Iran', regionCode: 'IR' },
  { name: 'Irak', regionCode: 'IQ' },
  { name: 'Irlandia', regionCode: 'IE' },
  { name: 'Israel', regionCode: 'IL' },
  { name: 'Italia', regionCode: 'IT' },
  { name: 'Jamaika', regionCode: 'JM' },
  { name: 'Jepang', regionCode: 'JP' },
  { name: 'Yordania', regionCode: 'JO' },
  { name: 'Kazakhstan', regionCode: 'KZ' },
  { name: 'Kenya', regionCode: 'KE' },
  { name: 'Kiribati', regionCode: 'KI' },
  { name: 'Korea Selatan', regionCode: 'KR' },
  { name: 'Kuwait', regionCode: 'KW' },
  { name: 'Kyrgyzstan', regionCode: 'KG' },
  { name: 'Laos', regionCode: 'LA' },
  { name: 'Latvia', regionCode: 'LV' },
  { name: 'Lebanon', regionCode: 'LB' },
  { name: 'Lesotho', regionCode: 'LS' },
  { name: 'Liberia', regionCode: 'LR' },
  { name: 'Libya', regionCode: 'LY' },
  { name: 'Liechtenstein', regionCode: 'LI' },
  { name: 'Lithuania', regionCode: 'LT' },
  { name: 'Luksemburg', regionCode: 'LU' },
  { name: 'Madagaskar', regionCode: 'MG' },
  { name: 'Malawi', regionCode: 'MW' },
  { name: 'Malaysia', regionCode: 'MY' },
  { name: 'Maladewa', regionCode: 'MV' },
  { name: 'Mali', regionCode: 'ML' },
  { name: 'Malta', regionCode: 'MT' },
  { name: 'Kepulauan Marshall', regionCode: 'MH' },
  { name: 'Mauritania', regionCode: 'MR' },
  { name: 'Mauritius', regionCode: 'MU' },
  { name: 'Meksiko', regionCode: 'MX' },
  { name: 'Mikronesia', regionCode: 'FM' },
  { name: 'Moldova', regionCode: 'MD' },
  { name: 'Monako', regionCode: 'MC' },
  { name: 'Mongolia', regionCode: 'MN' },
  { name: 'Montenegro', regionCode: 'ME' },
  { name: 'Maroko', regionCode: 'MA' },
  { name: 'Mozambik', regionCode: 'MZ' },
  { name: 'Myanmar (Burma)', regionCode: 'MM' },
  { name: 'Namibia', regionCode: 'NA' },
  { name: 'Nauru', regionCode: 'NR' },
  { name: 'Nepal', regionCode: 'NP' },
  { name: 'Belanda', regionCode: 'NL' },
  { name: 'Selandia Baru', regionCode: 'NZ' },
  { name: 'Nikaragua', regionCode: 'NI' },
  { name: 'Niger', regionCode: 'NE' },
  { name: 'Nigeria', regionCode: 'NG' },
  { name: 'Makedonia Utara', regionCode: 'MK' },
  { name: 'Norwegia', regionCode: 'NO' },
  { name: 'Oman', regionCode: 'OM' },
  { name: 'Pakistan', regionCode: 'PK' },
  { name: 'Palau', regionCode: 'PW' },
  { name: 'Panama', regionCode: 'PA' },
  { name: 'Papua Nugini', regionCode: 'PG' },
  { name: 'Paraguay', regionCode: 'PY' },
  { name: 'Peru', regionCode: 'PE' },
  { name: 'Filipina', regionCode: 'PH' },
  { name: 'Polandia', regionCode: 'PL' },
  { name: 'Portugal', regionCode: 'PT' },
  { name: 'Qatar', regionCode: 'QA' },
  { name: 'Rumania', regionCode: 'RO' },
  { name: 'Rusia', regionCode: 'RU' },
  { name: 'Rwanda', regionCode: 'RW' },
  { name: 'Saint Kitts dan Nevis', regionCode: 'KN' },
  { name: 'Saint Lucia', regionCode: 'LC' },
  { name: 'Saint Vincent dan Grenadine', regionCode: 'VC' },
  { name: 'Samoa', regionCode: 'WS' },
  { name: 'San Marino', regionCode: 'SM' },
  { name: 'Sao Tome dan Principe', regionCode: 'ST' },
  { name: 'Arab Saudi', regionCode: 'SA' },
  { name: 'Senegal', regionCode: 'SN' },
  { name: 'Serbia', regionCode: 'RS' },
  { name: 'Seychelles', regionCode: 'SC' },
  { name: 'Sierra Leone', regionCode: 'SL' },
  { name: 'Singapura', regionCode: 'SG' },
  { name: 'Slowakia', regionCode: 'SK' },
  { name: 'Slovenia', regionCode: 'SI' },
  { name: 'Kepulauan Solomon', regionCode: 'SB' },
  { name: 'Somalia', regionCode: 'SO' },
  { name: 'Afrika Selatan', regionCode: 'ZA' },
  { name: 'Spanyol', regionCode: 'ES' },
  { name: 'Sri Lanka', regionCode: 'LK' },
  { name: 'Sudan', regionCode: 'SD' },
  { name: 'Suriname', regionCode: 'SR' },
  { name: 'Swedia', regionCode: 'SE' },
  { name: 'Swiss', regionCode: 'CH' },
  { name: 'Suriah', regionCode: 'SY' },
  { name: 'Taiwan', regionCode: 'TW' },
  { name: 'Tajikistan', regionCode: 'TJ' },
  { name: 'Tanzania', regionCode: 'TZ' },
  { name: 'Thailand', regionCode: 'TH' },
  { name: 'Timor Leste', regionCode: 'TL' },
  { name: 'Togo', regionCode: 'TG' },
  { name: 'Tonga', regionCode: 'TO' },
  { name: 'Trinidad dan Tobago', regionCode: 'TT' },
  { name: 'Tunisia', regionCode: 'TN' },
  { name: 'Turki', regionCode: 'TR' },
  { name: 'Turkmenistan', regionCode: 'TM' },
  { name: 'Tuvalu', regionCode: 'TV' },
  { name: 'Uganda', regionCode: 'UG' },
  { name: 'Ukraina', regionCode: 'UA' },
  { name: 'Uni Emirat Arab', regionCode: 'AE' },
  { name: 'Britania Raya', regionCode: 'GB' },
  { name: 'Amerika Serikat', regionCode: 'US' },
  { name: 'Uruguay', regionCode: 'UY' },
  { name: 'Uzbekistan', regionCode: 'UZ' },
  { name: 'Vanuatu', regionCode: 'VU' },
  { name: 'Venezuela', regionCode: 'VE' },
  { name: 'Vietnam', regionCode: 'VN' },
  { name: 'Yaman', regionCode: 'YE' },
  { name: 'Zambia', regionCode: 'ZM' },
  { name: 'Zimbabwe', regionCode: 'ZW' },
];
