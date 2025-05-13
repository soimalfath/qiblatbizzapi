import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private _userRepository: Repository<UserEntity>,
  ) {}

  async getUserProfile(id: string) {
    return await this._userRepository.findOne({ where: { id } });
  }

  async updateUserProfile(email: string, updatedata: UpdateUserDto) {
    const userExists = await this._userRepository.findOne({ where: { email } });
    if (!userExists) throw new NotFoundException('User not found');

    Object.assign(userExists, updatedata);
    return this._userRepository.save(userExists);
  }

  async getAllUser() {
    const users = await this._userRepository.find({
      where: { role: '1' as any },
    });
    return users;
  }
}
