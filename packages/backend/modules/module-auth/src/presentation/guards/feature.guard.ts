import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  type CustomDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '@be/tenant';
import { EntitlementsService, type PlanFeature } from '@be/billing/entitlements';

export const REQUIRES_FEATURE_KEY = 'requires_feature';

/** Gate a route/resolver behind a plan feature (Phase 5). Use after AuthGuard. */
export const RequiresFeature = (feature: PlanFeature): CustomDecorator =>
  SetMetadata(REQUIRES_FEATURE_KEY, feature);

/**
 * Denies access (403) when the current school's plan lacks the `@RequiresFeature`
 * feature. Reads schoolId from the tenant context (seeded by AuthGuard), so it must
 * run after AuthGuard. No decorator → pass-through.
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlements: EntitlementsService,
    private readonly tenant: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<PlanFeature | undefined>(REQUIRES_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) return true;
    await this.entitlements.assertFeature(this.tenant.requireSchoolId(), feature);
    return true;
  }
}
