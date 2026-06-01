import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Int,
  Parent,
} from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/inputs/update-user.input';
import { ValidRolesArgs } from './dto/args/roles.arg';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { ValidRoles } from './../auth/enums/valid-roles.enum';
import { ItemsService } from './../items/items.service';
import { PaginationArgs } from './../common/dto/args/pagination.args';
import { SearchArgs } from './../common/dto/args/search.args';
import { Item } from './../items/entities/item.entity';
import { ListsService } from './../lists/lists.service';
import { List } from './../lists/entities/list.entity';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @CurrentUser([ValidRoles.admin]) user: User,
    @Args() paginationDto: PaginationArgs,
    @Args() validRolesDto: ValidRolesArgs,
    @Args() searchTermDto: SearchArgs,
  ): Promise<User[]> {
    console.log({ paginationDto, searchTermDto, validRolesDto });

    return this.usersService.pagination(
      paginationDto,
      validRolesDto.roles,
      searchTermDto.search,
    );
  }

  @Query(() => User, { name: 'user' })
  findOne(
    @CurrentUser([ValidRoles.admin]) user: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<User> {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User, { name: 'blockUser' })
  blockUser(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<User> {
    return this.usersService.block(id, authUser);
  }

  @Mutation(() => User, { name: 'updateUser' })
  updateUser(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Args('updateUserInput') dto: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(dto.id, dto, authUser);
  }

  @ResolveField(() => Int, { name: 'itemCount' })
  async itemCount(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.itemsService.countItemsByUser(user);
  }

  @ResolveField(() => [Item], { name: 'items' })
  async getItemsByUser(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Parent() user: User,
    @Args() paginationDto: PaginationArgs,
    @Args() searchDto: SearchArgs,
  ): Promise<Item[]> {
    return this.itemsService.pagination(paginationDto, user, searchDto.search);
  }

  @ResolveField(() => Int, { name: 'listCount' })
  async listCount(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Parent() user: User,
  ): Promise<number> {
    return this.listsService.countListsByUser(user);
  }

  @ResolveField(() => [List], { name: 'lists' })
  async getListsByUser(
    @CurrentUser([ValidRoles.admin]) authUser: User,
    @Parent() user: User,
    @Args() paginationDto: PaginationArgs,
    @Args() searchDto: SearchArgs,
  ): Promise<List[]> {
    return this.listsService.pagination(paginationDto, user, searchDto.search);
  }
}
