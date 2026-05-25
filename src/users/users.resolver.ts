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
import { ItemsService } from 'src/items/items.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {}

  @Query(() => [User], { name: 'users' })
  findAll(
    @CurrentUser([ValidRoles.admin]) user: User,
    @Args() dto: ValidRolesArgs,
  ): Promise<User[]> {
    return this.usersService.findAll(dto.roles);
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
    return await this.itemsService.countItemsByUser(user);
  }
}
