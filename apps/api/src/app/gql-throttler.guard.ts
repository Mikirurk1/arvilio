import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { resolveThrottleKey } from './throttle-tracker';

/**
 * Tenant-aware ThrottlerGuard (G13).
 *
 * Tracker key priority:
 *   1. schoolId (from JWT claim `sid`) — per-tenant tier
 *   2. userId  (from JWT claim `sub`) — per-user tier
 *   3. IP                             — fallback / auth tier
 *
 * Named throttle tiers (defined in AppModule):
 *   global — 120 req/min per resolved key (any authenticated or anon request)
 *   auth   — 10 req/15 min per IP (login, signup, password-reset — always IP-keyed)
 *   tenant — 600 req/min per schoolId (prevents one school from saturating the API)
 *
 * Endpoints opt into `auth` via @Throttle({ auth: { limit: 10, ttl: 900_000 } }).
 * All other endpoints only see the `global` tier unless they also set `tenant`.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: unknown; res: unknown } {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{ req: unknown; res: unknown }>();
      return { req: ctx.req, res: ctx.res };
    }
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }

  /**
   * Derive the tracker key.
   * - For the `auth` throttler we always use IP so the limit is per-source,
   *   not per-account (prevents credential-stuffing via shared IPs).
   * - For `tenant` we use schoolId from the JWT `sid` claim.
   * - For `global` (and fallback) we prefer userId, then IP.
   */
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const ip = ((req['ip'] as string) ?? 'unknown');
    const headers = req['headers'] as Record<string, string> | undefined;
    return resolveThrottleKey(ip, headers?.['authorization']);
  }

  /**
   * Skip throttling when the request carries a matching E2E bypass token.
   *
   * Token resolution (first non-empty wins):
   *   1. E2E_THROTTLE_BYPASS_TOKEN env var (set this in CI / .env.local)
   *   2. 'dev-e2e-bypass' fallback — only active outside production
   *
   * Production has no fallback: set E2E_THROTTLE_BYPASS_TOKEN explicitly or
   * the bypass is impossible. Never ship this to staging with a known token.
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const isProd = process.env['NODE_ENV'] === 'production';
    const expected =
      process.env['E2E_THROTTLE_BYPASS_TOKEN'] ?? (isProd ? null : 'dev-e2e-bypass');
    if (!expected) return false;
    const { req } = this.getRequestResponse(context);
    const headers = (req as Record<string, unknown>)['headers'] as Record<string, string> | undefined;
    return headers?.['x-e2e-skip-throttle'] === expected;
  }
}
