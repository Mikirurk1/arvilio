import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@be/prisma';
import { TenantContextService, HostSchoolResolver, normalizeTenantHost } from '@be/tenant';

/**
 * Phase 2 — tenant resolution from the request.
 *
 * Seeds `schoolId` into the per-request tenant context for public/unauthenticated
 * surfaces (signup, marketplace, custom domains) where there is no JWT yet. For
 * authenticated requests the auth guard later overrides this from the user's
 * active membership (Phase 3).
 *
 * Resolution priority (the web middleware forwards the first two as hints):
 *  1. `x-school-slug` → `School.slug` (subdomain `acme.arvilio.app`)
 *  2. `x-school-host` / `Host` → verified `SchoolDomain.hostname` (custom domain)
 *
 * Safe by construction: a no-op when CLS is inactive, when nothing maps to a
 * tenant, or when a schoolId is already established; lookup errors are swallowed.
 */
@Injectable()
export class TenantResolutionMiddleware implements NestMiddleware {
  private readonly domainResolver: HostSchoolResolver;
  private readonly slugResolver: HostSchoolResolver;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantContextService,
  ) {
    this.domainResolver = new HostSchoolResolver(async (host) => {
      const domain = await this.prisma.schoolDomain.findUnique({
        where: { hostname: host },
        select: { schoolId: true, verified: true },
      });
      return domain?.verified ? domain.schoolId : null;
    });
    this.slugResolver = new HostSchoolResolver(async (slug) => {
      const school = await this.prisma.school.findUnique({
        where: { slug },
        select: { id: true, status: true },
      });
      return school && school.status !== 'SUSPENDED' ? school.id : null;
    });
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!this.tenant.isActive() || this.tenant.schoolId) {
      next();
      return;
    }
    try {
      const schoolId = await this.resolveSchoolId(req);
      if (schoolId) this.tenant.setSchoolId(schoolId);
    } catch {
      // Tenant resolution is best-effort on every route; a transient lookup
      // failure must not break requests (auth guard still resolves from JWT).
    }
    next();
  }

  private async resolveSchoolId(req: Request): Promise<string | null> {
    const slug = headerValue(req, 'x-school-slug');
    if (slug) return this.slugResolver.resolve(slug.toLowerCase());

    const host = normalizeTenantHost(headerValue(req, 'x-school-host') ?? req.headers.host);
    if (host) return this.domainResolver.resolve(host);
    return null;
  }
}

function headerValue(req: Request, name: string): string | null {
  const raw = req.headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ? value.trim() : null;
}
