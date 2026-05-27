import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsSelect, FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserInput } from './dto/inputs/create-user.input';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { User } from './entities/user.entity';
import { handleDBException } from '../common/helpers/errors.helper';
import { ValidRoles } from './../auth/enums/valid-roles.enum';
import { removeNullFields } from './../common/helpers/dto.helper';

@Injectable()
export class UsersService {
  private readonly loggerName: string = 'UsersService';

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
      handleDBException(`${this.loggerName}->create`, error);
      throw error;
    }
  }

  async findAll(roles: ValidRoles[] = []): Promise<User[]> {
    if (roles.length === 0)
      return await this.usersRepository.find({
        // TODO: Lazy in entity
        // relations: { lastUpdateBy: true },
      });

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
      handleDBException(`${this.loggerName}->findOneBy`, error);
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    const user = await this.findOneById(id);

    try {
      const cleanDto = removeNullFields(dto, [
        'email',
        'fullName',
        'roles',
        'isActive',
      ]);
      const { password, ...userData } = cleanDto;
      Object.assign(user, userData, { lastUpdateBy: updateBy });
      if (password) user.password = bcrypt.hashSync(password, 10);

      return await this.usersRepository.save(user);
    } catch (error) {
      handleDBException(`${this.loggerName}->update`, error);
      throw error;
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const user = await this.findOneById(id);
    user.isActive = false;
    user.lastUpdateBy = adminUser;

    return await this.usersRepository.save(user);
  }

  remove(id: number) {
    throw new Error('UsersService-remove not implemented.');
  }

  async createMany(data: CreateUserInput[], createdBy?: User): Promise<void> {
    const CHUNK_SIZE = 500;

    try {
      const users = data.map((dto) =>
        this.usersRepository.create({
          ...dto,
          password: bcrypt.hashSync(dto.password, 10),
          lastUpdateBy: createdBy,
        }),
      );

      for (let i = 0; i < users.length; i += CHUNK_SIZE) {
        await this.usersRepository.insert(users.slice(i, i + CHUNK_SIZE));
      }
    } catch (error) {
      handleDBException(`${this.loggerName}->createMany`, error);
    }
  }

  private async deleteAll() {
    const query = this.usersRepository.createQueryBuilder('user');

    try {
      await query.delete().where({}).execute();
    } catch (error) {
      handleDBException(`${this.loggerName}->deleteAll`, error);
    }
  }
}
