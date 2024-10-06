import { CreateUserDto } from './base-user.dto';

export class RegisterUserDto extends CreateUserDto {
  createdAt: Date;
}
