import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';
import { User } from './../users/entities/user.entity';
import { List } from './entities/list.entity';
import { handleDBException } from './../common/helpers/errors.helper';

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

  findAll() {
    return `This action returns all lists`;
  }

  findOne(id: number) {
    return `This action returns a #${id} list`;
  }

  update(id: number, updateListInput: UpdateListInput) {
    return `This action updates a #${id} list`;
  }

  remove(id: number) {
    return `This action removes a #${id} list`;
  }
}
