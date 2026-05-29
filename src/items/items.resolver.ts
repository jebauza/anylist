import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput } from './dto/inputs/create-item.input';
import { UpdateItemInput } from './dto/inputs/update-item.input';
import { JwtAuthGuard } from './..//auth/guards/jwt-auth.guard';
import { CurrentUser } from './..//auth/decorators/current-user.decorator';
import { User } from './../users/entities/user.entity';
import { PaginationArgs } from './../common/dto/args/pagination.args';
import { SearchArgs } from './../common/dto/args/search.args';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  @Mutation(() => Item, { name: 'createItem' })
  createItem(
    @CurrentUser()
    authUser: User,

    @Args('createItemInput', { type: () => CreateItemInput })
    dto: CreateItemInput,
  ): Promise<Item> {
    return this.itemsService.create(dto, authUser);
  }

  @Query(() => [Item], { name: 'items' })
  findAll(
    @CurrentUser()
    authUser: User,

    @Args() paginationDto: PaginationArgs,
    @Args() searchDto: SearchArgs,
  ): Promise<Item[]> {
    console.log({ paginationDto, searchDto });

    return this.itemsService.pagination(
      paginationDto,
      authUser,
      searchDto.search,
    );
  }

  @Query(() => Item, { name: 'item' })
  findOne(
    @CurrentUser()
    authUser: User,

    @Args('id', { type: () => ID }, ParseUUIDPipe)
    id: string,
  ): Promise<Item> {
    return this.itemsService.findOne(id, authUser);
  }

  @Mutation(() => Item)
  updateItem(
    @CurrentUser()
    authUser: User,

    @Args('updateItemInput')
    dto: UpdateItemInput,
  ): Promise<Item> {
    return this.itemsService.update(dto.id, dto, authUser);
  }

  @Mutation(() => Item)
  removeItem(
    @CurrentUser()
    authUser: User,

    @Args('id', { type: () => ID }, ParseUUIDPipe)
    id: string,
  ): Promise<Item> {
    return this.itemsService.remove(id, authUser);
  }
}
