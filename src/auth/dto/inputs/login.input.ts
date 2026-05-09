import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @Field(() => String, { description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string;
}
