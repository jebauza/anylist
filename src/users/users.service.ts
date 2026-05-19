import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { handleDBException } from '../common/helpers/errors.helper';
import { ValidRoles } from './../auth/enums/valid-roles.enum';

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
        password: bcrypt.hashSync(dto.password, 10),
      });
      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      handleDBException('UsersService->create', error);
      throw error;
    }
  }

  async findAll(roles: ValidRoles[] = []): Promise<User[]> {
    if (roles.length === 0) return await this.usersRepository.find();

    return await this.usersRepository
      .createQueryBuilder()
      .andWhere('ARRAY[roles] && ARRAY[:...filterRoles]')
      .setParameter('filterRoles', roles)
      .getMany();
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

  async block(id: string): Promise<User> {
    const user = await this.findOneById(id);
    user.isActive = false;

    return await this.usersRepository.save(user);
  }

  remove(id: number) {
    throw new Error('UsersService-remove not implemented.');
  }
}
