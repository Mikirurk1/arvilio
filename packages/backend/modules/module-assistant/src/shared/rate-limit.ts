/** Simple per-user sliding window rate limit (in-memory; fine for single-node MVP). */

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 20;

export function assertAssistantRateLimit(
  userId: string,
  limit = DEFAULT_LIMIT,
  now = Date.now(),
): void {
  let bucket = buckets.get(userId);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(userId, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter(t => now - t < WINDOW_MS);
  if (bucket.timestamps.length >= limit) {
    const err = new Error('Too many assistant requests. Try again in a minute.');
    (err as Error & { statusCode: number }).statusCode = 429;
    throw err;
  }
  bucket.timestamps.push(now);
}

/** Test helper */
export function _resetAssistantRateLimitForTests(): void {
  buckets.clear();
}
