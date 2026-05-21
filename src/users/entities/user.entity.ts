import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column('varchar', { name: 'email', length: 100, unique: true })
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
  @JoinColumn({ name: 'last_update_by' })
  @ManyToOne(() => User, (user) => user.lastUpdateBy, {
    nullable: true,
    lazy: true,
  })
  lastUpdateBy?: User;
}
