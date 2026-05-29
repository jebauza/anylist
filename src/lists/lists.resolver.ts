import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
import { CreateListInput } from './dto/inputs/create-list.input';
import { UpdateListInput } from './dto/inputs/update-list.input';

import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from './../auth/decorators/current-user.decorator';

@Resolver(() => List)
@UseGuards(JwtAuthGuard)
export class ListsResolver {
  constructor(private readonly listsService: ListsService) {}

  @Mutation(() => List, { name: 'createList' })
  createList(
    @CurrentUser()
    authUser: User,

    @Args('createListInput')
    dto: CreateListInput,
  ): Promise<List> {
    return this.listsService.create(dto, authUser);
  }

  @Query(() => [List], { name: 'lists' })
  findAll() {
    return this.listsService.findAll();
  }

  @Query(() => List, { name: 'list' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.listsService.findOne(id);
  }

  @Mutation(() => List)
  updateList(@Args('updateListInput') updateListInput: UpdateListInput) {
    return this.listsService.update(updateListInput.id, updateListInput);
  }

  @Mutation(() => List)
  removeList(@Args('id', { type: () => Int }) id: number) {
    return this.listsService.remove(id);
  }
}
