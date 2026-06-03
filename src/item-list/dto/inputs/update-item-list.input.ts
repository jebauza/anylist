import { CreateItemListInput } from './create-item-list.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateItemListInput extends PartialType(CreateItemListInput) {
  @Field(() => Int)
  id: number;
}
