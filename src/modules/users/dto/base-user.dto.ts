import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  MinLength,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '../../auth/enum/role.enum';
import { Match } from '../../../common/decorators/confirmPassword.decorator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  providerID: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: number;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  picture?: string;
}

export class UserResponseDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  provider: string;

  @IsString()
  providerID: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsEnum(Role)
  role: Role;
}

export class CreateUserManualUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: number;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
