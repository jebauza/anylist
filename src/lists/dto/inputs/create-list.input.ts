import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateListInput {
  @Field(() => String, {
    name: 'name',
    nullable: false,
    description: 'The name of the list',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}
