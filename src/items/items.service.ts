import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { handleDBException } from './../common/helpers/errors.helper';
import { isUUID } from 'class-validator';

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

  async findAll(): Promise<Item[]> {
    // TODO: filtrar, paginar
    const items: Item[] = await this.itemsRepository.find();

    return items;
  }

  async findOne(id: string): Promise<Item> {
    if (!isUUID(id))
      throw new BadRequestException(`Id (${id}) is not a valid UUID`);

    const item: Item | null = await this.itemsRepository.findOneBy({ id: id });

    if (!item) throw new NotFoundException(`Item with id (${id}) not found`);

    return item;
  }

  update(id: number, updateItemInput: UpdateItemInput) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
