import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemListService } from './item-list.service';
import { ItemListResolver } from './item-list.resolver';
import { ItemList } from './entities/item-list.entity';
import { ListsModule } from './../lists/lists.module';
import { ItemsModule } from './../items/items.module';

@Module({
  providers: [ItemListResolver, ItemListService],
  imports: [TypeOrmModule.forFeature([ItemList]), ListsModule, ItemsModule],
  exports: [],
})
export class ItemListModule {}
