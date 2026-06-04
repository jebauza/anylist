import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Int,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User } from './../users/entities/user.entity';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { PaginationArgs } from './../common/dto/args/pagination.args';
import { SearchArgs } from './../common/dto/args/search.args';
import { ItemList } from './../item-list/entities/item-list.entity';
import { ItemListService } from './../item-list/item-list.service';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(
    private readonly listsService: ListsService,
    private readonly itemListService: ItemListService,
  ) {}

  @Mutation(() => List, { name: 'createList' })
  createList(
    @CurrentUser() authUser: User,
    @Args('createListInput') dto: CreateListInput,
  ): Promise<List> {
    return this.listsService.create(dto, authUser);
  }

  @Query(() => [List], { name: 'lists' })
  findAll(
    @CurrentUser() authUser: User,
    @Args() paginationDto: PaginationArgs,
    @Args() searchDto: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.pagination(
      paginationDto,
      authUser,
      searchDto.search,
    );
  }

  @Query(() => List, { name: 'list' })
  findOne(
    @CurrentUser() authUser: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<List> {
    return this.listsService.findOne(id, authUser);
  }

  @Mutation(() => List)
  updateList(
    @CurrentUser() authUser: User,
    @Args('updateListInput') dto: UpdateListInput,
  ): Promise<List> {
    return this.listsService.update(dto.id, dto, authUser);
  }

  @Mutation(() => List)
  removeList(
    @CurrentUser() authUser: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<List> {
    return this.listsService.remove(id, authUser);
  }

  @ResolveField(() => [ItemList], { name: 'items' })
  getItemDetails(
    @Parent() list: List,
    @Args() paginationDto: PaginationArgs,
    @Args() searchDto: SearchArgs,
  ): Promise<ItemList[]> {
    return this.itemListService.paginationByList(
      paginationDto,
      list,
      searchDto.search,
    );
  }

  @ResolveField(() => Int, { name: 'totalItems' })
  getTotalItems(@Parent() list: List): Promise<number> {
    return this.itemListService.countItemsByList(list);
  }
}
