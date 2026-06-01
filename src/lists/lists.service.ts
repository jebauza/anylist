import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';
import { User } from './../users/entities/user.entity';
import { List } from './entities/list.entity';
import {
  handleDBException,
  isUuidException,
} from './../common/helpers/errors.helper';
import { PaginationArgs } from './../common/dto/args/pagination.args';
import { removeNullFields } from './../common/helpers/dto.helper';

@Injectable()
export class ListsService {
  private readonly loggerName: string = 'ListsService';

  constructor(
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
  ) {}

  async create(dto: CreateListInput, user: User): Promise<List> {
    try {
      const list: List = this.listsRepository.create({
        ...dto,
        user,
      });
      await this.listsRepository.save(list);

      return list;
    } catch (error) {
      handleDBException(`${this.loggerName}->create`, error);
      throw error;
    }
  }

  async pagination(
    dto: PaginationArgs,
    user: User,
    search?: string,
  ): Promise<List[]> {
    const { offset, limit } = dto;

    const query = this.listsRepository
      .createQueryBuilder()
      .where(`"user_id" = :userId`, { userId: user.id })
      .take(limit)
      .skip(offset)
      .orderBy('name', 'ASC');

    if (search) {
      query.andWhere(`"name" ILIKE :search`, { search: `%${search}%` });
    }

    return await query.getMany();
  }

  async findOne(id: string, user?: User): Promise<List> {
    isUuidException(id);

    const list: List | null = await this.listsRepository.findOne({
      where: {
        id,
        ...(user && { user: { id: user.id } }),
      },
    });

    if (!list) throw new NotFoundException(`list ${id} not found or not yours`);

    return list;
  }

  async update(id: string, dto: UpdateListInput, user?: User): Promise<List> {
    const list: List = await this.findOne(id, user);

    try {
      const cleanDto = removeNullFields(dto, ['name']);
      Object.assign(list, cleanDto, { id });

      return await this.listsRepository.save(list);
    } catch (error) {
      handleDBException(`${this.loggerName}->update`, error);
      throw error;
    }
  }

  async remove(id: string, user?: User): Promise<List> {
    const list: List = await this.findOne(id, user);
    await this.listsRepository.remove(list);

    return Object.assign(list, { id, user });
  }

  async countListsByUser(user: User): Promise<number> {
    return await this.listsRepository.count({
      where: { user: { id: user.id } },
    });
  }
}
