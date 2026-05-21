import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'items' })
export class Item {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column('varchar', { name: 'name', length: 255, unique: true })
  name!: string;

  @Field(() => Float)
  @Column('float', { name: 'quantity', default: 0 })
  quantity!: number;

  @Field(() => String, { nullable: true })
  @Column('varchar', { name: 'quantity_units', length: 20, nullable: true })
  quantityUnits?: string;
}
