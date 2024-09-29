import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserProfile(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getAllUser() {
    const users = await this.userRepository.find({
      where: { role: '1' as any },
    });
    return users;
  }
}
