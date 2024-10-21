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

  async updateUserProfile(email: string, user: UpdateUserDto) {
    const userExists = this.userRepository.findOne({ where: { email } });
    if (!userExists) throw new NotFoundException('User not found');

    Object.assign(userExists, user);
    return this.userRepository.save(user);
  }

  async getAllUser() {
    const users = await this.userRepository.find({
      where: { role: '1' as any },
    });
    return users;
  }
}
