import { Injectable } from '@nestjs/common';
import { CreateItemListInput } from './dto/inputs/create-item-list.input';
import { UpdateItemListInput } from './dto/inputs/update-item-list.input';
import { ItemList } from './entities/item-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { handleDBException } from 'src/common/helpers/errors.helper';
import { User } from './../users/entities/user.entity';
import { ListsService } from './../lists/lists.service';
import { ItemsService } from './../items/items.service';

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

  findAll() {
    throw Error('This action returns all itemList');
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} itemList`;
  // }

  // update(id: number, updateItemListInput: UpdateItemListInput) {
  //   return `This action updates a #${id} itemList`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} itemList`;
  // }
}
