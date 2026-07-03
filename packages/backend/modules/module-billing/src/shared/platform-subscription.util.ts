import type { SchoolStatus, SubscriptionStatus } from '@prisma/client';
import type { PlanKey } from './subscription-plans';

/**
 * Platform (Layer-B) subscription helpers — school → platform billing on the
 * platform's own Stripe account (env-configured), distinct from the per-school
 * Layer-A PSP. Pure + env-driven so the webhook state machine stays testable.
 */

/** Purchasable plans → Stripe price id (from env). TRIAL is not purchasable. */
export function priceIdForPlan(plan: PlanKey): string | null {
  if (plan === 'STARTER') return process.env['STRIPE_PRICE_STARTER']?.trim() || null;
  if (plan === 'PRO') return process.env['STRIPE_PRICE_PRO']?.trim() || null;
  return null;
}

/** Reverse map a Stripe price id back to a plan key (for subscription.updated). */
export function planForPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  if (priceId === process.env['STRIPE_PRICE_STARTER']?.trim()) return 'STARTER';
  if (priceId === process.env['STRIPE_PRICE_PRO']?.trim()) return 'PRO';
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
