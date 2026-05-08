import { Injectable } from '@nestjs/common';
import { SignupInput } from './dto/inputs/signup.input';
import { UsersService } from './../users/users.service';
import { AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(dto: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
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
