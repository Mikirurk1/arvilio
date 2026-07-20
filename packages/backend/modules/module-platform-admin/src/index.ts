export * from './platform-admin.module';
export {
  PlatformAdminGuard,
  PlatformAdmin,
  PLATFORM_ROLES_KEY,
} from './presentation/guards/platform-admin.guard';
export {
  PlatformAuditService,
  type PlatformAuditEntryDto,
} from './application/platform-audit.service';
export {
  PlatformSchoolsService,
  type PlatformDashboardDto,
  type PlatformSchoolRowDto,
  type PlatformSchoolDetailDto,
} from './application/platform-schools.service';
export {
  PlatformUsersService,
  type PlatformUserRowDto,
  type PlatformUserStatsDto,
  type PlatformSchoolMemberRowDto,
  type PlatformUserBriefDto,
} from './application/platform-users.service';
export type { PlatformPageDto } from './application/platform-page.util';
export { PlatformImpersonationService } from './application/platform-impersonation.service';
export {
  PlatformPaymentMethodsService,
  type PaymentAllowlistDto,
} from './application/platform-payment-methods.service';
export {
  TrialLifecycleService,
  TRIAL_GRACE_DAYS,
  DUNNING_GRACE_DAYS,
} from './application/trial-lifecycle.service';
export {
  PromoCodesService,
  type PromoCodeDto,
  type CreatePromoCodeInput,
} from './application/promo-codes.service';
