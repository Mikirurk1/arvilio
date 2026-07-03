/**
 * Leaf-services entry point (no `BillingModule`). Importing this avoids pulling the
 * billing module + GraphQL resolvers (which transitively import `@be/auth`), so
 * upstream modules can use entitlements/storage accounting without tripping the
 * pre-existing auth↔billing barrel cycle.
 */
export {
  EntitlementsService,
  type StorageUsageDto,
  type EntitlementsSummaryDto,
} from './application/entitlements.service';
export { StorageAccountingService } from './application/storage-accounting.service';
export { PlatformSubscriptionService } from './application/platform-subscription.service';
export { PURCHASABLE_PLANS } from './shared/platform-subscription.util';
export {
  PLAN_CATALOG,
  DEFAULT_PLAN_KEY,
  planFor,
  type PlanKey,
  type PlanEntitlements,
  type PlanFeature,
} from './shared/subscription-plans';
