import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';

import { ItemListService } from './item-list.service';
import { ItemList } from './entities/item-list.entity';
import { CreateItemListInput } from './dto/inputs/create-item-list.input';
import { UpdateItemListInput } from './dto/inputs/update-item-list.input';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { User } from './../users/entities/user.entity';

@Resolver(() => ItemList)
@UseGuards(JwtAuthGuard)
export class ItemListResolver {
  constructor(private readonly itemListService: ItemListService) {}

  @Mutation(() => ItemList)
  createItemList(
    @CurrentUser() authUser: User,
    @Args('createItemListInput') dto: CreateItemListInput,
  ): Promise<ItemList> {
    return this.itemListService.create(dto, authUser);
  }

  @Query(() => ItemList, { name: 'itemList' })
  findOne(
    @CurrentUser() authUser: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<ItemList> {
    return this.itemListService.findOne(id, authUser);
  }

  @Mutation(() => ItemList)
  updateItemList(
    @CurrentUser() authUser: User,
    @Args('updateItemListInput') dto: UpdateItemListInput,
  ): Promise<ItemList> {
    return this.itemListService.update(dto.id, dto, authUser);
  }

  // @Mutation(() => ItemList)
  // removeItemList(@Args('id', { type: () => Int }) id: number) {
  //   return this.itemListService.remove(id);
  // }
}
