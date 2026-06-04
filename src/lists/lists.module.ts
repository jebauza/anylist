import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';
import { List } from './entities/list.entity';
import { ItemListModule } from './../item-list/item-list.module';

@Module({
  providers: [ListsResolver, ListsService],
  imports: [TypeOrmModule.forFeature([List]), forwardRef(() => ItemListModule)],
  exports: [ListsService, TypeOrmModule],
})
export class ListsModule {}
