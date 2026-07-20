import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@be/prisma';
import { BillingModule } from '@be/billing';
import { VocabularyModule } from '@be/vocabulary';
import { PlatformAdminGuard } from './presentation/guards/platform-admin.guard';
import { PlatformAuditService } from './application/platform-audit.service';
import { PlatformSchoolsService } from './application/platform-schools.service';
import { PlatformUsersService } from './application/platform-users.service';
import { PlatformImpersonationService } from './application/platform-impersonation.service';
import { PlatformPaymentMethodsService } from './application/platform-payment-methods.service';
import { PlatformLlmService } from './application/platform-llm.service';
import { PlatformSmtpService } from './application/platform-smtp.service';
import { TrialLifecycleService } from './application/trial-lifecycle.service';
import { PromoCodesService } from './application/promo-codes.service';
import { TrialLifecycleScheduler } from './presentation/trial-lifecycle.scheduler';
import { PlatformAdminController } from './presentation/rest/platform-admin.controller';
import { PlatformBillingController } from './presentation/rest/platform-billing.controller';

/**
 * Platform admin console module (Phase 4 / ADR-009). The single authorized
 * consumer of `asPlatform()` for cross-tenant reads/actions. Surfaced only on the
 * platform domain, behind `AuthGuard` + `PlatformAdminGuard`.
 *
 * ADR-010: imports BillingModule for PlatformBillingRailsService.
 */
@Module({
  imports: [PrismaModule, BillingModule, forwardRef(() => VocabularyModule)],
  controllers: [PlatformAdminController, PlatformBillingController],
  providers: [
    PlatformAdminGuard,
    PlatformAuditService,
    PlatformSchoolsService,
    PlatformUsersService,
    PlatformImpersonationService,
    PlatformPaymentMethodsService,
    PlatformLlmService,
    PlatformSmtpService,
    TrialLifecycleService,
    TrialLifecycleScheduler,
    PromoCodesService,
  ],
  exports: [
    PlatformAdminGuard,
    PlatformAuditService,
    PlatformSchoolsService,
    PlatformUsersService,
    PlatformImpersonationService,
    PlatformPaymentMethodsService,
    PlatformLlmService,
    PlatformSmtpService,
    TrialLifecycleService,
    PromoCodesService,
  ],
})
export class PlatformAdminModule {}
