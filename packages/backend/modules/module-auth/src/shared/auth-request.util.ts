import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../presentation/guards/auth.guard';

export function getReqRes(context: ExecutionContext): {
  req: AuthenticatedRequest;
  res: Response;
} {
  if (context.getType() === 'http') {
    return {
      req: context.switchToHttp().getRequest<AuthenticatedRequest>(),
      res: context.switchToHttp().getResponse<Response>(),
    };
  }
  const gql = GqlExecutionContext.create(context);
  const ctx = gql.getContext<{ req: AuthenticatedRequest; res: Response }>();
  return { req: ctx.req, res: ctx.res };
}
