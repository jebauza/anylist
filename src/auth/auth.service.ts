import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupInput } from './dto/inputs/signup.input';
import { UsersService } from './../users/users.service';
import { AuthResponse } from './types/auth-response.type';
import { LoginInput } from './dto/inputs/login.input';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    const payload = { id: userId };
    return this.jwtService.sign(payload);
  }

  async signup(dto: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    const token = this.getJwtToken(user.id);

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

    const token = this.getJwtToken(user.id);

    return { token, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    delete (user as Partial<User>).password;
    return user;
  }

  me(user: User): User {
    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);
    return { token, user };
  }
}
