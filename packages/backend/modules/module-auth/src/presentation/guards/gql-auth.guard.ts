import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { seedTenantContext, type AuthenticatedRequest } from './auth.guard';
import { getReqRes } from '../../shared/auth-request.util';
import { AuthSessionService } from '../../application/auth-session.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(
    private readonly sessionAuth: AuthSessionService,
    private readonly tenant: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (!userId) throw new UnauthorizedException();
    (req as AuthenticatedRequest).user = { id: userId };
    await seedTenantContext(this.sessionAuth, this.tenant, userId);
    return true;
  }
}

export function getGqlRequest(context: ExecutionContext): AuthenticatedRequest {
  return getReqRes(context).req as AuthenticatedRequest;
}
