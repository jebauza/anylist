import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
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
      handleDBException('UsersService->create', error);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.usersRepository.find();

    return users;
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`User with id: ${id} not found.`);
    }
  }

  async findOneBy(
    fields: FindOptionsWhere<User>,
    select?: FindOptionsSelect<User>,
  ): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: fields, select });
    } catch (error) {
      handleDBException('UsersService->findOneBy', error);
      throw error;
    }
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    throw new Error('UsersService-update not implemented.');
  }

  block(id: string) {
    throw new Error('UsersService-remove not implemented.');
  }
}
