import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateListInput } from './create-list.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateListInput extends PartialType(CreateListInput) {
  @Field(() => ID, { description: 'The id of the list' })
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
