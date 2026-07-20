/**
 * Code catalog of platform-owned payment rails (ADR-010).
 * Enablement + secrets live in PlatformSettings; this file is the schema of rails.
 */

export type PlatformRailId =
  | 'stripe_platform'
  | 'liqpay_platform'
  | 'monopay_platform'
  | 'wayforpay_platform';

export type PlatformRailRegion = '*' | 'UA';

export type PlatformRailSecretField = {
  key: string;
  label: string;
};

export type PlatformRailConfigField = {
  key: string;
  label: string;
  placeholder?: string;
};

export type PlatformRailDefinition = {
  id: PlatformRailId;
  title: string;
  description: string;
  regions: PlatformRailRegion[];
  /** Brand tile for Control Plane cards */
  brandBg: string;
  brandFg: string;
  configFields: PlatformRailConfigField[];
  secretFields: PlatformRailSecretField[];
};

export const PLATFORM_BILLING_RAIL_CATALOG: PlatformRailDefinition[] = [
  {
    id: 'stripe_platform',
    title: 'Stripe',
    description: 'Cards via Stripe Checkout / Billing Portal (global).',
    regions: ['*'],
    brandBg: '#635bff',
    brandFg: '#ffffff',
    configFields: [],
    secretFields: [
      { key: 'secretKey', label: 'Secret key' },
      { key: 'webhookSecret', label: 'Webhook signing secret' },
    ],
  },
  {
    id: 'liqpay_platform',
    title: 'LiqPay',
    description: 'Ukrainian cards & wallets (subscription checkout later).',
    regions: ['UA'],
    brandBg: '#1e88e5',
    brandFg: '#ffffff',
    configFields: [{ key: 'publicKey', label: 'Public key', placeholder: 'sandbox_… or live' }],
    secretFields: [{ key: 'privateKey', label: 'Private key' }],
  },
  {
    id: 'monopay_platform',
    title: 'MonoPay',
    description: 'Plata by mono (subscription checkout later).',
    regions: ['UA'],
    brandBg: '#000000',
    brandFg: '#ffffff',
    configFields: [],
    secretFields: [{ key: 'token', label: 'Merchant token' }],
  },
  {
    id: 'wayforpay_platform',
    title: 'WayForPay',
    description: 'Hosted checkout (subscription checkout later).',
    regions: ['UA'],
    brandBg: '#00a651',
    brandFg: '#ffffff',
    configFields: [
      { key: 'merchantAccount', label: 'Merchant account' },
      { key: 'merchantDomain', label: 'Merchant domain' },
    ],
    secretFields: [{ key: 'secretKey', label: 'Merchant secret key' }],
  },
];

export function platformRailById(id: string): PlatformRailDefinition | undefined {
  return PLATFORM_BILLING_RAIL_CATALOG.find((r) => r.id === id);
}

/** How Campus plans should collect Starter/Pro prices for this rail. */
export function pricingModeForRail(railId: string): 'stripe' | 'amount' {
  return railId.startsWith('stripe') ? 'stripe' : 'amount';
}

/** Rails available for a billing country (ISO alpha-2). Default region UA. */
export function resolvePlatformRailsForRegion(
  enabledIds: Iterable<string>,
  region: string | null | undefined,
): PlatformRailId[] {
  const country = (region?.trim().toUpperCase() || 'UA') as string;
  const enabled = new Set(enabledIds);
  return PLATFORM_BILLING_RAIL_CATALOG.filter((rail) => {
    if (!enabled.has(rail.id)) return false;
    return rail.regions.includes('*') || rail.regions.includes(country as PlatformRailRegion);
  }).map((r) => r.id);
}
