import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    nullable: true,
    defaultValue: 0,
    description: 'Skip count (default: 0, min: 0)',
  })
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 50,
    description: 'Page size (default: 50, min: 1, max: 100)',
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
