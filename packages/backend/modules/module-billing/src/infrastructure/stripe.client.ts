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
