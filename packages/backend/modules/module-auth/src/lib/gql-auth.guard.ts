import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.guard';
import { getReqRes } from './auth-request.util';
import { AuthSessionService } from './auth-session.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly sessionAuth: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (!userId) throw new UnauthorizedException();
    (req as AuthenticatedRequest).user = { id: userId };
    return true;
  }
}

export function getGqlRequest(context: ExecutionContext): AuthenticatedRequest {
  return getReqRes(context).req as AuthenticatedRequest;
}
