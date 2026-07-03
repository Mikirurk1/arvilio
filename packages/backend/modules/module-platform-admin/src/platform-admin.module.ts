import { Module } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { PlatformAdminGuard } from './presentation/guards/platform-admin.guard';
import { PlatformAuditService } from './application/platform-audit.service';
import { PlatformSchoolsService } from './application/platform-schools.service';
import { PlatformImpersonationService } from './application/platform-impersonation.service';
import { PlatformPaymentMethodsService } from './application/platform-payment-methods.service';
import { TrialLifecycleService } from './application/trial-lifecycle.service';
import { PromoCodesService } from './application/promo-codes.service';
import { TrialLifecycleScheduler } from './presentation/trial-lifecycle.scheduler';
import { PlatformAdminController } from './presentation/rest/platform-admin.controller';

/**
 * Platform admin console module (Phase 4 / ADR-009). The single authorized
 * consumer of `asPlatform()` for cross-tenant reads/actions. Surfaced only on the
 * platform domain, behind `AuthGuard` + `PlatformAdminGuard`.
 *
 * Phase 4A: auth/audit foundation. 4B: dashboard + schools read. 4C: suspend/
 * activate + audit + impersonation. Payment allowlist + web console arrive in 4D.
 */
@Module({
  imports: [PrismaModule],
  controllers: [PlatformAdminController],
  providers: [
    PlatformAdminGuard,
    PlatformAuditService,
    PlatformSchoolsService,
    PlatformImpersonationService,
    PlatformPaymentMethodsService,
    TrialLifecycleService,
    TrialLifecycleScheduler,
    PromoCodesService,
  ],
  exports: [
    PlatformAdminGuard,
    PlatformAuditService,
    PlatformSchoolsService,
    PlatformImpersonationService,
    PlatformPaymentMethodsService,
    TrialLifecycleService,
    PromoCodesService,
  ],
})
export class PlatformAdminModule {}
