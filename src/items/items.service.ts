import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { handleDBException } from './../common/helpers/errors.helper';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(dto: CreateItemInput): Promise<Item> {
    try {
      const item: Item = this.itemsRepository.create(dto);
      await this.itemsRepository.save(item);

      return item;
    } catch (error) {
      handleDBException('ItemsService', error);
      throw error;
    }
  }

  findAll() {
    return [];
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemInput: UpdateItemInput) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
