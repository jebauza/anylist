import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
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

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

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
}
