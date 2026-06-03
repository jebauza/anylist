import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateItemListInput {
  @Field(() => ID, { description: 'Associated Item ID' })
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @Field(() => ID, { description: 'Target List ID' })
  @IsUUID()
  @IsNotEmpty()
  listId!: string;

  @Field(() => Int, { description: 'Purchase quantity (min: 1)' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: false,
    description: 'Completion status',
  })
  @IsBoolean()
  @Transform(
    ({ value }: { value: boolean | null | undefined }) => value ?? false,
  )
  completed: boolean = false;
}
