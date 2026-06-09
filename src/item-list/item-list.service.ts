import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateItemListInput } from './dto/inputs/create-item-list.input';
import { UpdateItemListInput } from './dto/inputs/update-item-list.input';
import { ItemList } from './entities/item-list.entity';
import {
  handleDBException,
  isUuidException,
} from './../common/helpers/errors.helper';
import { User } from './../users/entities/user.entity';
import { ListsService } from './../lists/lists.service';
import { ItemsService } from './../items/items.service';
import { List } from './../lists/entities/list.entity';
import { PaginationArgs } from './../common/dto/args/pagination.args';
import { removeNullFields } from './../common/helpers/dto.helper';

@Injectable()
export class ItemListService {
  private readonly loggerName: string = 'ItemListService';

  constructor(
    @InjectRepository(ItemList)
    private readonly itemListRepository: Repository<ItemList>,

    private readonly listsService: ListsService,
    private readonly itemsService: ItemsService,
  ) {}

  async create(dto: CreateItemListInput, user: User): Promise<ItemList> {
    const list = await this.listsService.findOne(dto.listId, user);
    const item = await this.itemsService.findOne(dto.itemId, user);

    try {
      const itemList: ItemList = this.itemListRepository.create({
        ...dto,
        list,
        item,
        // item: { id: dto.itemId },
        // list: { id: dto.listId },
      });
      await this.itemListRepository.save(itemList);

      return itemList;
    } catch (error) {
      handleDBException(`${this.loggerName}->create`, error);
      throw error;
    }
  }

  async findAllByList(list: List): Promise<ItemList[]> {
    return await this.itemListRepository.find({
      where: { list: { id: list.id } },
    });
  }

  async countItemsByList(list: List): Promise<number> {
    return await this.itemListRepository.count({
      where: { list: { id: list.id } },
    });
  }

  async paginationByList(
    dto: PaginationArgs,
    list: List,
    search?: string,
  ): Promise<ItemList[]> {
    const { offset, limit } = dto;

    const query = this.itemListRepository
      .createQueryBuilder()
      .where(`"list_id" = :listId`, { listId: list.id })
      .take(limit)
      .skip(offset);

    if (search) {
      console.log(search);
    }

    return await query.getMany();
  }

  async findOne(id: string, user: User): Promise<ItemList> {
    isUuidException(id);

    const itemList: ItemList | null = await this.itemListRepository.findOne({
      where: {
        id,
        ...(user && { list: { user: { id: user.id } } }),
      },
    });

    if (!itemList)
      throw new NotFoundException(`ItemList_id (${id}) not found or not yours`);

    return itemList;
  }

  async update(
    id: string,
    dto: UpdateItemListInput,
    user: User,
  ): Promise<ItemList> {
    const itemList: ItemList = await this.findOne(id, user);
    const { listId, itemId, ...restDto } = dto;
    const cleanDto = removeNullFields(restDto, ['quantity', 'completed']);

    try {
      // const queryBuilder = this.itemListRepository
      //   .createQueryBuilder()
      //   .update()
      //   .set({ ...cleanDto, id })
      //   .where('id = :id', { id });

      // if (listId) queryBuilder.set({ list: { id: listId } });
      // if (itemId) queryBuilder.set({ item: { id: itemId } });

      // await queryBuilder.execute();

      // return this.findOne(id, user);

      Object.assign(
        itemList,
        cleanDto,
        {
          ...(listId && {
            list: await this.listsService.findOne(listId, user),
          }),
          ...(itemId && {
            item: await this.itemsService.findOne(itemId, user),
          }),
        },
        { id },
      );

      return await this.itemListRepository.save(itemList);
    } catch (error) {
      handleDBException(`${this.loggerName}->update`, error);
      throw error;
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} itemList`;
  // }
}
