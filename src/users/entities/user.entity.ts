import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'users' })
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column('varchar', { length: 100, unique: true })
  email!: string;

  @Column('varchar', { length: 100 })
  password!: string;

  @Field(() => String)
  @Column('varchar', { length: 255 })
  fullName!: string;

  @Field(() => [String])
  @Column('text', { array: true, default: ['user'] })
  roles!: string[];

  @Field(() => Boolean)
  @Column('boolean', { default: true })
  isActive!: boolean;

  // TODO: relaciones
}
