import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserProfile(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUserProfile(email: string, updatedata: UpdateUserDto) {
    const userExists = await this.userRepository.findOne({ where: { email } });
    if (!userExists) throw new NotFoundException('User not found');

    Object.assign(userExists, updatedata);
    return this.userRepository.save(userExists);
  }

  async getAllUser() {
    const users = await this.userRepository.find({
      where: { role: '1' as any },
    });
    return users;
  }
}
