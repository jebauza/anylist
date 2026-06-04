import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateItemListInput } from './create-item-list.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateItemListInput extends PartialType(CreateItemListInput) {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
