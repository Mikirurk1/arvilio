/**
 * Tenant host normalization (Phase 2).
 *
 * Public/unauthenticated surfaces resolve the active tenant from the request
 * Host header (e.g. `acme.arvilio.app` or a school's custom domain) against the
 * `SchoolDomain` table. This module holds the *pure* normalization step so it
 * can be unit-tested and reused without a DB dependency (keeping `@be/tenant`
 * free of `@be/prisma`, which would be a layering cycle).
 */

/** Hosts that never map to a tenant (local dev, raw IPs, bare apex). */
const NON_TENANT_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
]);

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Normalize a raw `Host` header into a lookup key, or `null` when the host
 * cannot belong to a tenant (empty, localhost, IP literal).
 *
 * - lowercases
 * - strips the port (`acme.arvilio.app:3000` -> `acme.arvilio.app`)
 * - strips a trailing dot (FQDN form)
 * - rejects localhost / IPv4 / IPv6-loopback
 */
export function normalizeTenantHost(rawHost: string | null | undefined): string | null {
  if (!rawHost) return null;
  let host = rawHost.trim().toLowerCase();
  if (!host) return null;

  // Strip IPv6 brackets for the loopback check, but only port-strip IPv4/hostnames.
  const isBracketed = host.startsWith('[');
  if (!isBracketed) {
    const colon = host.indexOf(':');
    if (colon !== -1) host = host.slice(0, colon);
  } else {
    const close = host.indexOf(']');
    if (close !== -1) host = host.slice(1, close);
  }

  if (host.endsWith('.')) host = host.slice(0, -1);
  if (!host) return null;
  if (NON_TENANT_HOSTS.has(host)) return null;
  if (IPV4_RE.test(host)) return null;

  return host;
}

/** How long a host -> schoolId resolution (including misses) is cached. */
export const HOST_CACHE_TTL_MS = 60_000;

type CacheEntry = { schoolId: string | null; expires: number };

/**
 * Caching host -> schoolId resolver. Caches misses too (negative caching) so an
 * unknown/typo host doesn't hit the DB on every request. Pure of Nest/Prisma —
 * the loader and clock are injected, which keeps the cache behavior unit-testable.
 */
export class HostSchoolResolver {
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly loader: (host: string) => Promise<string | null>,
    private readonly now: () => number = () => Date.now(),
    private readonly ttlMs: number = HOST_CACHE_TTL_MS,
  ) {}

  async resolve(host: string): Promise<string | null> {
    const cached = this.cache.get(host);
    if (cached && cached.expires > this.now()) return cached.schoolId;
    const schoolId = await this.loader(host);
    this.cache.set(host, { schoolId, expires: this.now() + this.ttlMs });
    return schoolId;
  }
}
