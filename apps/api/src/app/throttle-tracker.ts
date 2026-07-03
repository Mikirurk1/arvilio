/**
 * Derive the rate-limit tracker key from a request (G13).
 *
 * Priority: schoolId (sid claim) → userId (sub claim) → IP.
 * Decodes the JWT without verifying — the key is used only for bucketing;
 * AuthGuard handles actual verification earlier in the pipeline.
 */
export function resolveThrottleKey(
  ip: string,
  authHeader: string | undefined,
): string {
  if (!authHeader?.startsWith('Bearer ')) return ip;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length < 3) return ip;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8'),
    ) as { sub?: string; sid?: string };
    return payload.sid ?? payload.sub ?? ip;
  } catch {
    return ip;
  }
}
