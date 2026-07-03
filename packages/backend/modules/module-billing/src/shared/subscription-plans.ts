/**
 * Subscription plan catalog + entitlements (Phase 5). Code-defined (not DB) for
 * now — the tier set is small and changes are deploys, not data. `SchoolSubscription.plan`
 * stores the key; trial / unknown schools fall back to the default (TRIAL) tier.
 */
export type PlanKey = 'TRIAL' | 'STARTER' | 'PRO';

export interface PlanEntitlements {
  key: PlanKey;
  /** null = unlimited. */
  maxActiveStudents: number | null;
  storageQuotaBytes: number;
  /** Max AI-assist requests per day per school (0 = feature not available). */
  aiCreditsPerDay: number;
  features: {
    customDomain: boolean;
    aiAssist: boolean;
    recordings: boolean;
  };
}

export type PlanFeature = keyof PlanEntitlements['features'];

const GB = 1024 * 1024 * 1024;

export const PLAN_CATALOG: Record<PlanKey, PlanEntitlements> = {
  TRIAL: {
    key: 'TRIAL',
    maxActiveStudents: 10,
    storageQuotaBytes: 1 * GB,
    aiCreditsPerDay: 0,
    features: { customDomain: false, aiAssist: false, recordings: false },
  },
  STARTER: {
    key: 'STARTER',
    maxActiveStudents: 50,
    storageQuotaBytes: 10 * GB,
    aiCreditsPerDay: 0,
    features: { customDomain: false, aiAssist: false, recordings: true },
  },
  PRO: {
    key: 'PRO',
    maxActiveStudents: null,
    storageQuotaBytes: 100 * GB,
    aiCreditsPerDay: 100,
    features: { customDomain: true, aiAssist: true, recordings: true },
  },
};

export const DEFAULT_PLAN_KEY: PlanKey = 'TRIAL';

/**
 * Effective tier for a school with **no paid subscription** but ACTIVE status —
 * i.e. the legacy single-school deployment migrating into SaaS. Grandfathered to
 * the top tier so existing usage is never retroactively capped (ADR-004 rule #8).
 */
export const GRANDFATHERED_PLAN_KEY: PlanKey = 'PRO';

/** Returns the plan key only if it is a paid tier (STARTER/PRO), else null. */
export function paidPlanKey(plan: string | null | undefined): PlanKey | null {
  const key = (plan ?? '').toUpperCase();
  return key === 'STARTER' || key === 'PRO' ? (key as PlanKey) : null;
}

/** Resolve entitlements for a stored plan string, falling back to the default tier. */
export function planFor(plan: string | null | undefined): PlanEntitlements {
  const key = (plan ?? '').toUpperCase() as PlanKey;
  return PLAN_CATALOG[key] ?? PLAN_CATALOG[DEFAULT_PLAN_KEY];
}
