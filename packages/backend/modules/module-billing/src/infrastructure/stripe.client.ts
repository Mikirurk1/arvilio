import Stripe from 'stripe';

const stripeSingletons = new Map<string, Stripe>();

export function getStripeClient(key: string | undefined): Stripe | null {
  if (!key) return null;
  const existing = stripeSingletons.get(key);
  if (existing) return existing;
  const client = new Stripe(key);
  stripeSingletons.set(key, client);
  return client;
}

export function getStripeWebhookSecret(secret: string | undefined): string | null {
  return secret?.trim() || null;
}

/** Platform (Layer-B) Stripe account — env fallback; prefer DB via PlatformBillingRailsService. */
export function getPlatformStripeClient(secretKey?: string | null): Stripe | null {
  return getStripeClient(secretKey?.trim() || process.env['STRIPE_PLATFORM_SECRET_KEY']?.trim());
}

export function getPlatformStripeWebhookSecret(webhookSecret?: string | null): string | null {
  return getStripeWebhookSecret(
    webhookSecret?.trim() || process.env['STRIPE_PLATFORM_WEBHOOK_SECRET'],
  );
}
