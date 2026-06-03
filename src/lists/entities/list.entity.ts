import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './../../users/entities/user.entity';
import { ItemList } from './../../item-list/entities/item-list.entity';

@ObjectType()
@Entity('lists')
export class List {
  @Field(() => ID, { description: 'The id of the list' })
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_lists_id' })
  id!: string;

  @Field(() => String, { description: 'The id of the list' })
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Field(() => User, { description: 'The user that owns the list' })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_lists_user_id' })
  @Index('IDX_lists_user_id')
  @ManyToOne(() => User, (user) => user.lists, {
    nullable: false,
    lazy: true,
  })
  user!: User;

  @Field(() => [ItemList], { description: 'The items in the list' })
  @OneToMany(() => ItemList, (itemList) => itemList.list, { lazy: true })
  itemDetails!: ItemList[];
}
