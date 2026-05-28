import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SearchArgs {
  @Field(() => String, { nullable: true, description: 'Search text' })
  @IsString()
  @IsOptional()
  search?: string;
}
