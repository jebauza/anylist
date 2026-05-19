import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (roles = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req as Request;
    const user = request.user;

    if (!user)
      throw new InternalServerErrorException(
        'No user inside request - make sure that we used the AuthGuard',
      );

    return user;
  },
);
