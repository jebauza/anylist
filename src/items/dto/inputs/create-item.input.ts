import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String, {
    name: 'name',
    nullable: false,
    description: 'Name of the item',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @Field(() => Float, {
    name: 'quantity',
    nullable: false,
    description: 'Quantity of the item',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  quantity!: number;

  @Field(() => String, {
    name: 'quantityUnits',
    nullable: true,
    description: 'Quantity units of the item',
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  quantityUnits!: string;
}
