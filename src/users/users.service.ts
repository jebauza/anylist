import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { handleDBException } from '../common/helpers/errors.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserInput): Promise<User> {
    try {
      const user = this.usersRepository.create({
        ...dto,
        password: bcrypt.hashSync(dto.password, 10) as string,
      });
      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      handleDBException('UsersService', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.usersRepository.find();

    return users;
  }

  findOne(id: string) {
    throw new Error('UsersService-findOne not implemented.');
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    throw new Error('UsersService-update not implemented.');
  }

  block(id: string) {
    throw new Error('UsersService-remove not implemented.');
  }
}
