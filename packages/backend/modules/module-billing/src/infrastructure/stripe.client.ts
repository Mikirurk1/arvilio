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

/** Platform (Layer-B) Stripe account — single env-configured account, not per-school. */
export function getPlatformStripeClient(): Stripe | null {
  return getStripeClient(process.env['STRIPE_PLATFORM_SECRET_KEY']?.trim());
}

export function getPlatformStripeWebhookSecret(): string | null {
  return getStripeWebhookSecret(process.env['STRIPE_PLATFORM_WEBHOOK_SECRET']);
}
