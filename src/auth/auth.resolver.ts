import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput } from './dto/inputs/signup.input';
import { AuthResponse } from './types/auth-response.type';
import { LoginInput } from './dto/inputs/login.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './../users/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, { name: 'signup' })
  signup(@Args('signupInput') dto: SignupInput): Promise<AuthResponse> {
    return this.authService.signup(dto);
  }

  @Mutation(() => AuthResponse, { name: 'login' })
  login(@Args('loginInput') dto: LoginInput): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return this.authService.me(user);
  }

  @Query(() => AuthResponse, { name: 'revaliteToken' })
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser(/* [ValidRoles.admin] */) user: User,
  ): AuthResponse {
    return this.authService.revalidateToken(user);
  }
}
