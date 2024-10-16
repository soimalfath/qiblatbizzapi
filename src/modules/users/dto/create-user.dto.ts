import { CreateUserDto, CreateUserManualUserDto } from './base-user.dto';

export class RegisterUserDto extends CreateUserDto {
  createdAt: Date;
}

export class RegisterManualUserDto extends CreateUserManualUserDto {
  createdAt: Date;
}
