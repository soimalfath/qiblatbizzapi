import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  IsStrongPassword,
} from 'class-validator';

import { Match } from '../../../common/decorators/confirmPassword.decorator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ConfirmResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
