import { ExecutionContext, UnauthorizedException, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!req.user?.id) throw new UnauthorizedException();
  return req.user.id;
});

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | null => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.user?.id ?? null;
  },
);
