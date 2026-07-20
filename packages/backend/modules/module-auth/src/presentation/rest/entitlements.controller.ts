import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantContextService } from '@be/tenant';
import {
  EntitlementsService,
  StorageAccountingService,
  type EntitlementsSummaryDto,
  type StorageReconcileResult,
} from '@be/billing/entitlements';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

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
    private readonly storage: StorageAccountingService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get('entitlements')
  getEntitlements(): Promise<EntitlementsSummaryDto> {
    return this.entitlements.getSummary(this.tenant.requireSchoolId());
  }

  /** Recompute storage meter from attachment tables (admin). Fixes seed/legacy drift. */
  @Post('entitlements/reconcile-storage')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  reconcileStorage(): Promise<StorageReconcileResult> {
    return this.storage.reconcile(this.tenant.requireSchoolId());
  }
}
