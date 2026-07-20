export { BillingModule } from './billing.module';
export { LessonBalanceService } from './application/lesson-balance.service';
export { PaymentSettingsService } from './application/payment-settings.service';
export { StaffPayrollService } from './application/staff-payroll.service';
export {
  EntitlementsService,
  type StorageUsageDto,
  type EntitlementsSummaryDto,
} from './application/entitlements.service';
export { StorageAccountingService } from './application/storage-accounting.service';
export { PlatformSubscriptionService } from './application/platform-subscription.service';
export {
  PlatformBillingRailsService,
  type PlatformBillingRailsDto,
  type PlatformBillingRailDto,
  type CampusSubscriptionProductDto,
  type PlatformRailTestResult,
  type ResolvedPlatformStripeConfig,
  normalizeBillingCountryInput,
} from './application/platform-billing-rails.service';
export {
  PLATFORM_BILLING_RAIL_CATALOG,
  resolvePlatformRailsForRegion,
  pricingModeForRail,
  type PlatformRailId,
} from './shared/platform-billing-rails.catalog';
export {
  readCampusSubscriptionProduct,
  resolveOfferFromProduct,
  planPriceFromOffer,
  coerceCampusSubscriptionRails,
  type CampusSubscriptionProductConfig,
  type ResolvedCampusSubscriptionOffer,
} from './shared/platform-billing-products';
export { PURCHASABLE_PLANS } from './shared/platform-subscription.util';
export {
  PLAN_CATALOG,
  DEFAULT_PLAN_KEY,
  planFor,
  type PlanKey,
  type PlanEntitlements,
  type PlanFeature,
} from './shared/subscription-plans';
