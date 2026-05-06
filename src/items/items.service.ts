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
import {
  handleDBException,
  isUuidException,
} from './../common/helpers/errors.helper';
import { removeNullFields } from './../common/helpers/dto.helper';
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
    isUuidException(id);

    const item: Item | null = await this.itemsRepository.findOneBy({ id: id });

    if (!item) throw new NotFoundException(`Item with id (${id}) not found`);

    return item;
  }

  async update(id: string, dto: UpdateItemInput): Promise<Item> {
    const item: Item = await this.findOne(id);

    try {
      // Not Null in DB
      const cleanDto = removeNullFields(dto, ['name', 'quantity']);
      Object.assign(item, cleanDto);

      return await this.itemsRepository.save(item);
    } catch (error) {
      handleDBException('ItemsService', error);
      throw error;
    }
  }

  async remove(id: string): Promise<Item> {
    const item: Item = await this.findOne(id);
    await this.itemsRepository.remove(item);

    return { ...item, id };
  }

  async removeBoolean(id: string): Promise<boolean> {
    // TODO: soft delete, integrida referencial
    isUuidException(id);
    const { affected } = await this.itemsRepository.delete(id);

    if (affected === 0) {
      throw new NotFoundException(`Item with id (${id}) not found`);
    }

    return true;
  }
}
