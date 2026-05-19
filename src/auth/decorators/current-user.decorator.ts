import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ValidRoles } from './../enums/valid-roles.enum';
import { User } from './../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const user = request.user as User | undefined;

    if (!user) {
      throw new InternalServerErrorException(
        'No user inside request - make sure that we used the AuthGuard',
      );
    }

    if (roles.length === 0) return user;

    for (const role of user.roles) {
      if (roles.includes(role as ValidRoles)) return user;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${roles.join(', ')}]`,
    );
  },
);
