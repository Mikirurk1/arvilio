/**
 * Leaf entry for Control Plane billing rails (no BillingModule / GraphQL).
 * Avoids the auth↔billing barrel cycle when platform-admin imports rails helpers.
 */
export {
  PlatformBillingRailsService,
  normalizeBillingCountryInput,
  type PlatformBillingRailsDto,
  type PlatformBillingRailDto,
  type CampusSubscriptionProductDto,
  type PlatformRailTestResult,
  type ResolvedPlatformStripeConfig,
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
  type CampusSubscriptionProductConfig,
  type ResolvedCampusSubscriptionOffer,
} from './shared/platform-billing-products';
