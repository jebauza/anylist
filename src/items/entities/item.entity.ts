import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'items' })
@Unique('UQ_items_name_unit', ['name', 'unit'])
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_items_id' })
  id!: string;

  @Field(() => String)
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', { name: 'unit', length: 20, default: '' })
  unit!: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'FK_items_user_id' })
  @Index('IDX_items_user_id')
  @ManyToOne(() => User, (user) => user.items, {
    nullable: false,
    lazy: true, // TypeORM loads the relation automatically when requested by GraphQL
  })
  user?: User;

  @BeforeInsert()
  @BeforeUpdate()
  normalize() {
    this.name = this.name.trim().toLowerCase();
    this.unit = this.unit.trim().toLowerCase();
  }
}
