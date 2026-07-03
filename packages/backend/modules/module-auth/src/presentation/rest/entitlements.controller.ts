import { Controller, Get, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import { EntitlementsService, type EntitlementsSummaryDto } from '@be/billing/entitlements';
import { AuthGuard } from '../guards/auth.guard';

/**
 * School-scoped entitlements + usage meter (Phase 5). Reads the current school's
 * plan limits and live usage (storage + seats) for the in-app usage meter. Lives
 * in `@be/auth` (which already depends on billing) and imports the billing leaf
 * barrel to avoid the auth↔billing module cycle.
 */
@Controller('billing')
@UseGuards(AuthGuard)
export class EntitlementsController {
  constructor(
    private readonly entitlements: EntitlementsService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get('entitlements')
  getEntitlements(): Promise<EntitlementsSummaryDto> {
    return this.entitlements.getSummary(this.tenant.requireSchoolId());
  }
}
