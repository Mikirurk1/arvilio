import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthenticatedRequest } from './auth.guard';

export const CurrentGqlUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: AuthenticatedRequest }>().req;
    if (!req.user?.id) throw new UnauthorizedException();
    return req.user.id;
  },
);
