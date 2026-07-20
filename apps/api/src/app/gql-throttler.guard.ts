import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { readAccessCookie, resolveThrottleKey } from './throttle-tracker';

/**
 * Tenant-aware ThrottlerGuard (G13).
 *
 * Tracker key priority:
 *   1. schoolId (JWT `sid`) — per-tenant
 *   2. userId  (JWT `sub`) — per-user
 *   3. IP — anon / pre-login
 *
 * JWT from `Authorization: Bearer` **or** httpOnly `arvilio_at` cookie
 * (web app uses cookie sessions; Bearer-only tracking bucketed all localhost
 * traffic onto one IP and tripped the limit during normal SPA navigation).
 *
 * Default tier: `global` (AppModule). Auth endpoints tighten it with
 * `@Throttle({ global: { ttl, limit } })`.
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

  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const ip = (req['ip'] as string) ?? 'unknown';
    const headers = req['headers'] as Record<string, string> | undefined;
    const cookies = req['cookies'] as Record<string, string> | undefined;
    const accessCookie = readAccessCookie(cookies, headers?.['cookie']);
    return resolveThrottleKey(ip, headers?.['authorization'], accessCookie);
  }

  /**
   * Skip throttling when the request carries a matching E2E bypass token.
   *
   * Token resolution (first non-empty wins):
   *   1. E2E_THROTTLE_BYPASS_TOKEN env var (set this in CI / .env.local)
   *   2. 'dev-e2e-bypass' fallback — only active outside production
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
