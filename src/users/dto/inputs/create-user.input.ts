import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ValidRoles } from './../../../auth/enums/valid-roles.enum';

@InputType()
export class CreateUserInput {
  @Field(() => String, {
    name: 'email',
    nullable: false,
    description: 'Email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @Field(() => String, {
    name: 'password',
    nullable: false,
    description: 'Password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string;

  @Field(() => String, {
    name: 'fullName',
    nullable: false,
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @Field(() => [ValidRoles], {
    name: 'roles',
    nullable: true,
    description: 'Roles of the user',
  })
  @IsArray()
  @IsOptional()
  roles?: ValidRoles[];

  @Field(() => Boolean, {
    name: 'isActive',
    nullable: true,
    description: 'Is active of the user',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
