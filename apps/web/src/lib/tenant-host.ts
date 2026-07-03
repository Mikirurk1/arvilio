/**
 * Tenant host parsing for the web app (Phase 2 routing).
 *
 * Pure helpers (no Next/runtime deps) so they unit-test cleanly and can run in
 * the Edge middleware. The backend remains the source of truth for tenant
 * resolution (verified `SchoolDomain` lookup); the web only extracts a *hint*
 * (the subdomain slug) and forwards it so the API can resolve faster / so the
 * app shell can branch apex vs. tenant.
 */

/** Root domain the platform runs on (e.g. `arvilio.app`). */
export const ROOT_DOMAIN = (process.env['NEXT_PUBLIC_ROOT_DOMAIN'] ?? 'arvilio.app')
  .trim()
  .toLowerCase();

/** Subdomains that are NOT tenants (platform surfaces). */
const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'platform']);

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/** Strip port + trailing dot, lowercase. Returns null for empty hosts. */
export function normalizeHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  let host = rawHost.trim().toLowerCase();
  if (!host) return null;
  if (!host.startsWith('[')) {
    const colon = host.indexOf(':');
    if (colon !== -1) host = host.slice(0, colon);
  }
  if (host.endsWith('.')) host = host.slice(0, -1);
  return host || null;
}

export type TenantHost =
  /** A tenant subdomain of ROOT_DOMAIN (e.g. `acme.arvilio.app`). */
  | { kind: 'subdomain'; slug: string }
  /** A custom domain — backend resolves it against `SchoolDomain`. */
  | { kind: 'custom'; hostname: string }
  /** Platform apex / www / reserved / localhost / IP — no tenant. */
  | { kind: 'platform' };

/**
 * Classify a request host into a tenant routing decision.
 * - `acme.arvilio.app` → subdomain slug `acme`
 * - `arvilio.app` / `www.arvilio.app` / reserved → platform
 * - `localhost` / IP → platform (dev)
 * - any other hostname → custom (resolve server-side)
 */
export function classifyTenantHost(rawHost: string | null | undefined): TenantHost {
  const host = normalizeHost(rawHost);
  if (!host || host === 'localhost' || IPV4_RE.test(host)) return { kind: 'platform' };

  if (host === ROOT_DOMAIN) return { kind: 'platform' };

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    // Only a single leftmost label is the tenant slug (`a.b.arvilio.app` is not a tenant).
    if (!sub || sub.includes('.') || RESERVED_SUBDOMAINS.has(sub)) return { kind: 'platform' };
    return { kind: 'subdomain', slug: sub };
  }

  return { kind: 'custom', hostname: host };
}
