import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';

@Resolver(() => Item)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item)
  createItem(
    @Args('createItemInput', { type: () => CreateItemInput })
    dto: CreateItemInput,
  ): Promise<Item> {
    return this.itemsService.create(dto);
  }

  @Query(() => [Item], { name: 'items' })
  findAll(): Promise<Item[]> {
    return this.itemsService.findAll();
  }

  @Query(() => Item, { name: 'item' })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Item> {
    return this.itemsService.findOne(id);
  }

  @Mutation(() => Item)
  updateItem(@Args('updateItemInput') dto: UpdateItemInput): Promise<Item> {
    return this.itemsService.update(dto.id, dto);
  }

  @Mutation(() => Item)
  removeItem(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Item> {
    return this.itemsService.remove(id);
  }
}
