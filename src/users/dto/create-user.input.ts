import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserInput {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;
}
