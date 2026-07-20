/**
 * Browser-side fetch to `/api/platform/*` (Next rewrite → Nest).
 * Use from client components for infinite-scroll lists.
 */

export class PlatformClientApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function platformClientGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const qs = params ? buildQuery(params) : '';
  const res = await fetch(`/api${path}${qs}`, {
    headers: { Accept: 'application/json' },
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new PlatformClientApiError(res.status, `Platform API ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
