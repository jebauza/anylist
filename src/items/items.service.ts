import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { ILike, Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import {
  handleDBException,
  isUuidException,
} from './../common/helpers/errors.helper';
import { removeNullFields } from './../common/helpers/dto.helper';
import { User } from './../users/entities/user.entity';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';

@Injectable()
export class ItemsService {
  private readonly loggerName: string = 'ProductsService';

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(dto: CreateItemInput, user: User): Promise<Item> {
    try {
      const item: Item = this.itemsRepository.create({
        ...dto,
        unit: dto.unit ? dto.unit.trim().toLowerCase() : '',
        user,
      });
      await this.itemsRepository.save(item);

      return item;
    } catch (error) {
      handleDBException(`${this.loggerName}->create`, error);
      throw error;
    }
  }

  async findAll(user: User): Promise<Item[]> {
    const items = await this.itemsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    return items;
  }

  async pagination(
    dto: PaginationArgs,
    user: User,
    search?: string,
  ): Promise<Item[]> {
    const { offset, limit } = dto;

    // const items = await this.itemsRepository.find({
    //   relations: {
    //     user: true,
    //   },
    //   where: {
    //     user: { id: user.id },
    //     ...(search && { name: ILike(`%${search}%`) }),
    //   },
    //   skip: offset,
    //   take: limit,
    //   order: { name: 'ASC' },
    // });

    const query = this.itemsRepository
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

  async findOne(id: string, user?: User): Promise<Item> {
    isUuidException(id);

    const item: Item | null = await this.itemsRepository.findOne({
      where: {
        id,
        ...(user && { user: { id: user.id } }),
      },
    });

    if (!item)
      throw new NotFoundException(`Item_id (${id}) not found or not yours`);

    // item.user = user;

    return item;
  }

  async update(id: string, dto: UpdateItemInput, user: User): Promise<Item> {
    const item: Item = await this.findOne(id, user);

    try {
      // Not Null in DB
      const cleanDto = removeNullFields(dto, ['name', 'unit']);
      Object.assign(item, cleanDto, { id });

      return await this.itemsRepository.save(item);
    } catch (error) {
      handleDBException(`${this.loggerName}->update`, error);
      throw error;
    }
  }

  async remove(id: string, user?: User): Promise<Item> {
    const item: Item = await this.findOne(id, user);
    await this.itemsRepository.remove(item);

    return Object.assign(item, { id, user });
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

  async countItemsByUser(user: User): Promise<number> {
    return await this.itemsRepository.count({
      where: { user: { id: user.id } },
    });
  }

  async createMany(data: CreateItemInput[], createdBy: User): Promise<void> {
    const CHUNK_SIZE = 500;

    try {
      const items = data.map((dto) =>
        this.itemsRepository.create({
          ...dto,
          user: createdBy,
        }),
      );

      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        await this.itemsRepository.insert(items.slice(i, i + CHUNK_SIZE));
      }
    } catch (error) {
      handleDBException(`${this.loggerName}->createMany`, error);
    }
  }

  private async deleteAll() {
    const query = this.itemsRepository.createQueryBuilder('item');

    try {
      await query.delete().where({}).execute();
    } catch (error) {
      handleDBException(`${this.loggerName}->deleteAll`, error);
    }
  }
}
