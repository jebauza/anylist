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

import { Item } from './../../items/entities/item.entity';
import { List } from './../../lists/entities/list.entity';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_users_id' })
  id!: string;

  @Field(() => String)
  @Index('UQ_users_email', { unique: true })
  @Column('varchar', { name: 'email', length: 100 })
  email!: string;

  @Column('varchar', { name: 'password', length: 100 })
  password!: string;

  @Field(() => String)
  @Column('varchar', { name: 'full_name', length: 255 })
  fullName!: string;

  @Field(() => [String])
  @Column('text', { name: 'roles', array: true, default: ['user'] })
  roles!: string[];

  @Field(() => Boolean)
  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @Field(() => User, { nullable: true })
  @JoinColumn({
    name: 'last_update_by',
    foreignKeyConstraintName: 'FK_users_last_update_by',
  })
  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  lastUpdateBy?: User;

  // @Field(() => [Item])
  @OneToMany(() => Item, (item) => item.user, { lazy: true })
  items!: Item[];

  @OneToMany(() => List, (list) => list.user, { lazy: true })
  lists!: List[];
}
