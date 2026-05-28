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
@Unique(['name', 'unit'])
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column('varchar', { name: 'name', length: 255 })
  name!: string;

  @Field(() => String, { nullable: true })
  @Column('varchar', { name: 'unit', length: 20, default: '' })
  unit!: string;

  @Field(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  @Index()
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
