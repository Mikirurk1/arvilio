import type { SchoolStatus, SubscriptionStatus } from '@prisma/client';
import type { PlanKey } from './subscription-plans';

/**
 * Platform (Layer-B) subscription helpers — school → platform billing on the
 * platform's own Stripe account (DB → env), distinct from the per-school
 * Layer-A PSP. Pure helpers stay testable.
 */

export type PlatformStripePriceOverrides = {
  starter?: string | null;
  pro?: string | null;
};

/** Purchasable plans → Stripe price id (override → env). TRIAL is not purchasable. */
export function priceIdForPlan(
  plan: PlanKey,
  prices?: PlatformStripePriceOverrides,
): string | null {
  if (plan === 'STARTER') {
    return prices?.starter?.trim() || process.env['STRIPE_PRICE_STARTER']?.trim() || null;
  }
  if (plan === 'PRO') {
    return prices?.pro?.trim() || process.env['STRIPE_PRICE_PRO']?.trim() || null;
  }
  return null;
}

/** Reverse map a Stripe price id back to a plan key (for subscription.updated). */
export function planForPriceId(
  priceId: string | null | undefined,
  prices?: PlatformStripePriceOverrides,
): PlanKey | null {
  if (!priceId) return null;
  const starter = prices?.starter?.trim() || process.env['STRIPE_PRICE_STARTER']?.trim();
  const pro = prices?.pro?.trim() || process.env['STRIPE_PRICE_PRO']?.trim();
  if (priceId === starter) return 'STARTER';
  if (priceId === pro) return 'PRO';
  return null;
}

/** Map a Stripe subscription status to our `SubscriptionStatus`. */
export function mapStripeSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE';
    case 'canceled':
    case 'incomplete_expired':
      return 'CANCELED';
    default:
      return 'PAST_DUE';
  }
}

/**
 * School lifecycle effect of a subscription status. PAST_DUE keeps the school
 * ACTIVE (dunning grace); CANCELED suspends (ADR-007 enforcement blocks members).
 */
export function schoolStatusForSubscription(status: SubscriptionStatus): SchoolStatus {
  switch (status) {
    case 'ACTIVE':
    case 'TRIALING':
    case 'PAST_DUE':
      return 'ACTIVE';
    case 'CANCELED':
      return 'SUSPENDED';
  }
}

export const PURCHASABLE_PLANS: PlanKey[] = ['STARTER', 'PRO'];
