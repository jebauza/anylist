import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Item } from './../../items/entities/item.entity';
import { List } from './../../lists/entities/list.entity';

@ObjectType()
@Entity('items_lists')
@Unique('UQ_items_lists_item_id_list_id', ['item', 'list'])
export class ItemList {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_items_lists_id',
  })
  id!: string;

  @Field(() => Int, {
    description: 'Purchase quantity',
    defaultValue: 1,
  })
  @Column('integer', { name: 'quantity', default: 1 })
  quantity: number = 1;

  @Field(() => Boolean, {
    description: 'Completion status',
    defaultValue: false,
    nullable: true,
  })
  @Column('boolean', { name: 'completed', default: false })
  completed: boolean = false;

  // @Field(() => Item, { description: 'Associated item' })
  @ManyToOne(() => Item, (item) => item.listDetails, {
    nullable: false,
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'item_id',
    foreignKeyConstraintName: 'FK_items_lists_item_id',
  })
  item!: Item;

  // @Field(() => List, { description: 'Parent list' })
  @ManyToOne(() => List, (list) => list.itemDetails, {
    nullable: false,
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'list_id',
    foreignKeyConstraintName: 'FK_items_lists_list_id',
  })
  @Index('IDX_items_lists_list_id')
  list!: List;
}
