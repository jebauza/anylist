import { Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { SeedService } from './seed.service';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { CurrentUser } from './../auth/decorators/current-user.decorator';
import { User } from './../users/entities/user.entity';

@Resolver()
// @UseGuards(JwtAuthGuard)
export class SeedResolver {
  constructor(private readonly seedService: SeedService) {}

  @Mutation(() => Boolean, { name: 'executeSeed', description: 'Execute seed' })
  async executeSeed(/* @CurrentUser() admin: User */): Promise<boolean> {
    return this.seedService.rundSeed();
  }
}
