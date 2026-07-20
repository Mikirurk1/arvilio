/**
 * Layer-B commercial policy types (ADR-010 region matrix).
 * Pure helpers — no Nest / Prisma. Connect products reserved as `connect_*` keys later.
 */

import type { PlatformRailId } from './platform-billing-rails.catalog';
import type { PlanKey } from './subscription-plans';

export const CAMPUS_SUBSCRIPTION_PRODUCT = 'campus_subscription' as const;

export type PlanPriceConfig = {
  stripePriceId?: string;
  amountMinor?: number;
};

export type CampusSubscriptionOfferConfig = {
  railId: PlatformRailId | string;
  currency: string;
  prices: {
    STARTER?: PlanPriceConfig;
    PRO?: PlanPriceConfig;
  };
};

export type CampusSubscriptionProductConfig = {
  default: CampusSubscriptionOfferConfig;
  countryOverrides: Array<CampusSubscriptionOfferConfig & { country: string }>;
};

export type PlatformBillingStoredConfig = {
  /** Default Layer-B rail when campus has no country override (synced to campus_subscription.default.railId). */
  defaultRailId?: string;
  rails?: Record<string, { enabled?: boolean; config?: Record<string, string> }>;
  products?: {
    campus_subscription?: CampusSubscriptionProductConfig;
    /** Reserved for Connect fee products — do not implement yet. */
    [key: string]: CampusSubscriptionProductConfig | undefined;
  };
};

export type ResolvedPlanPrice = {
  stripePriceId: string | null;
  amountMinor: number | null;
};

export type ResolvedCampusSubscriptionOffer = {
  billingCountry: string | null;
  railId: string;
  currency: string;
  source: 'override' | 'default';
  prices: {
    STARTER: ResolvedPlanPrice;
    PRO: ResolvedPlanPrice;
  };
};

const EMPTY_PRICE: ResolvedPlanPrice = { stripePriceId: null, amountMinor: null };

function normalizeCountry(raw: string | null | undefined): string | null {
  const c = raw?.trim().toUpperCase();
  if (!c || !/^[A-Z]{2}$/.test(c)) return null;
  return c;
}

function resolvePlanPrice(raw: PlanPriceConfig | undefined): ResolvedPlanPrice {
  if (!raw) return { ...EMPTY_PRICE };
  const stripePriceId = raw.stripePriceId?.trim() || null;
  const amountMinor =
    typeof raw.amountMinor === 'number' && Number.isFinite(raw.amountMinor) && raw.amountMinor > 0
      ? Math.floor(raw.amountMinor)
      : null;
  return { stripePriceId, amountMinor };
}

function normalizeOffer(raw: CampusSubscriptionOfferConfig | undefined): CampusSubscriptionOfferConfig {
  return {
    railId: raw?.railId?.trim() || 'stripe_platform',
    currency: (raw?.currency?.trim() || 'EUR').toUpperCase(),
    prices: {
      STARTER: raw?.prices?.STARTER,
      PRO: raw?.prices?.PRO,
    },
  };
}

/**
 * Compat: older installs stored Stripe price IDs on `rails.stripe_platform.config`.
 * Synthesize a default product when `products.campus_subscription` is missing.
 */
export function readCampusSubscriptionProduct(
  stored: PlatformBillingStoredConfig | null | undefined,
): CampusSubscriptionProductConfig {
  const existing = stored?.products?.campus_subscription;
  if (existing?.default) {
    return {
      default: normalizeOffer(existing.default),
      countryOverrides: (existing.countryOverrides ?? [])
        .map((row) => {
          const country = normalizeCountry(row.country);
          if (!country) return null;
          return { ...normalizeOffer(row), country };
        })
        .filter((r): r is CampusSubscriptionOfferConfig & { country: string } => r != null),
    };
  }

  const stripeCfg = stored?.rails?.stripe_platform?.config ?? {};
  return {
    default: {
      railId: 'stripe_platform',
      currency: 'EUR',
      prices: {
        STARTER: stripeCfg.priceStarter
          ? { stripePriceId: stripeCfg.priceStarter }
          : undefined,
        PRO: stripeCfg.pricePro ? { stripePriceId: stripeCfg.pricePro } : undefined,
      },
    },
    countryOverrides: [],
  };
}

/** Resolve offer from school billing country — never from IP. */
export function resolveOfferFromProduct(
  product: CampusSubscriptionProductConfig,
  billingCountry: string | null | undefined,
): ResolvedCampusSubscriptionOffer {
  const country = normalizeCountry(billingCountry);
  const override =
    country != null
      ? product.countryOverrides.find((o) => o.country === country)
      : undefined;
  const offer = override ? normalizeOffer(override) : normalizeOffer(product.default);
  return {
    billingCountry: country,
    railId: offer.railId,
    currency: offer.currency,
    source: override ? 'override' : 'default',
    prices: {
      STARTER: resolvePlanPrice(offer.prices.STARTER),
      PRO: resolvePlanPrice(offer.prices.PRO),
    },
  };
}

export function planPriceFromOffer(
  offer: ResolvedCampusSubscriptionOffer,
  plan: PlanKey,
): ResolvedPlanPrice | null {
  if (plan !== 'STARTER' && plan !== 'PRO') return null;
  return offer.prices[plan];
}

export function normalizeBillingCountryInput(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string') return null;
  return normalizeCountry(raw);
}

export function parseCampusSubscriptionInput(body: unknown): CampusSubscriptionProductConfig {
  const raw = (body ?? {}) as {
    default?: CampusSubscriptionOfferConfig;
    countryOverrides?: Array<CampusSubscriptionOfferConfig & { country: string }>;
  };
  if (!raw.default?.railId) {
    throw new Error('default.railId is required');
  }
  const product = readCampusSubscriptionProduct({
    products: {
      campus_subscription: {
        default: raw.default,
        countryOverrides: raw.countryOverrides ?? [],
      },
    },
  });
  const countries = new Set<string>();
  for (const row of product.countryOverrides) {
    if (countries.has(row.country)) {
      throw new Error(`Duplicate country override: ${row.country}`);
    }
    countries.add(row.country);
  }
  return product;
}

/**
 * When a saved railId is no longer enabled+configured, point offers at fallbackRailId
 * so Campus plans UI never mounts a phantom select value.
 */
export function coerceCampusSubscriptionRails(
  product: CampusSubscriptionProductConfig,
  allowedRailIds: Iterable<string>,
  fallbackRailId: string,
): CampusSubscriptionProductConfig {
  const allowed = new Set(allowedRailIds);
  const coerce = <T extends { railId: string }>(offer: T): T => {
    if (allowed.has(offer.railId)) return offer;
    return { ...offer, railId: fallbackRailId || offer.railId };
  };
  return {
    default: coerce(product.default),
    countryOverrides: product.countryOverrides.map((row) => coerce(row)),
  };
}

