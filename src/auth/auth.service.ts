import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupInput } from './dto/inputs/signup.input';
import { UsersService } from './../users/users.service';
import { AuthResponse } from './types/auth-response.type';
import { LoginInput } from './dto/inputs/login.input';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(dto: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    const token = 'token';

    return { token, user };
  }

  async login(dto: LoginInput): Promise<AuthResponse> {
    const { email, password } = dto;
    const user = await this.usersService.findOneBy(
      { email },
      {
        id: true,
        email: true,
        password: true,
        fullName: true,
        roles: true,
        isActive: true,
      },
    );

    if (!user) throw new UnauthorizedException('Invalid credentials (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials (password)');

    const token = 'token';

    return { token, user };
  }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthInput: UpdateAuthInput) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
