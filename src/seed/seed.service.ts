import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, Repository, SelectQueryBuilder } from 'typeorm';

import { ItemsService } from './../items/items.service';
import { UsersService } from './../users/users.service';
import { ValidRoles } from './../auth/enums/valid-roles.enum';
import { CreateUserInput } from './../users/dto/inputs/create-user.input';
import { initialData } from './data/seed-data';
import { User } from './../users/entities/user.entity';
import { Item } from './../items/entities/item.entity';
import { handleDBException } from './../common/helpers/errors.helper';

@Injectable()
export class SeedService {
  private readonly loggerName: string = 'SeedService';
  private isProd: boolean;
  private admin: User | null = null;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,

    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {
    this.isProd = configService.get('STAGE') === 'prod';
  }

  async rundSeed(): Promise<boolean> {
    if (this.isProd)
      throw new UnauthorizedException('We cannot run seed in prod');

    // Clear Tables
    await this.clearTable(this.itemsRepository.createQueryBuilder());
    await this.clearTable(this.usersRepository.createQueryBuilder());

    // Insert
    await this.insertUsers();
    await this.insertItems();

    return true;
  }

  private async clearTable(query: SelectQueryBuilder<object>): Promise<void> {
    try {
      await query.delete().where({}).execute();
    } catch (error) {
      handleDBException(`${this.loggerName}->clearTable`, error);
    }
  }

  private async insertUsers(): Promise<void> {
    await this.usersService.createMany(initialData.users);

    this.admin = await this.usersService.findOneBy({
      roles: ArrayContains([ValidRoles.admin]),
    });

    const FAKE_USERS_COUNT = 100;
    const INACTIVE_PERCENTAGE = 0.2; // 20%
    const fakeUsers: CreateUserInput[] = Array.from(
      { length: FAKE_USERS_COUNT },
      (_, i) => ({
        email: `fake.user-${i + 1}@test.com`,
        password: 'Abc123',
        fullName: `Fake User ${i + 1}`,
        roles: [ValidRoles.user],
        isActive: Math.random() >= INACTIVE_PERCENTAGE,
      }),
    );
    await this.usersService.createMany(fakeUsers, this.admin ?? undefined);
  }

  private async insertItems(): Promise<void> {
    const users = await this.usersService.findAll();
    const items = initialData.items;
    const SPLITS = 2;
    const chunkSize = Math.ceil(items.length / SPLITS);

    for (let i = 0; i < SPLITS; i++) {
      await this.itemsService.createMany(
        items.slice(i * chunkSize, (i + 1) * chunkSize),
        users[Math.floor(Math.random() * users.length)],
      );
    }

    const MAX = 10;
    const UNITS = [
      'kg',
      'liters',
      'grams',
      'units',
      'dozens',
      'ml',
      'packs',
      '',
    ];
    let itemCounter = 0;

    for (const user of users) {
      const count = Math.floor(Math.random() * MAX) + 1;
      const fakeItems = Array.from({ length: count }, () => ({
        name: `fake-item-${++itemCounter}`,
        unit: UNITS[Math.floor(Math.random() * UNITS.length)],
      }));
      await this.itemsService.createMany(fakeItems, user);
    }
  }
}
