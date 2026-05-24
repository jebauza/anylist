import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @Field(() => String, {
    name: 'unit',
    nullable: true,
    description: 'Unit of the item',
  })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  unit?: string;
}
