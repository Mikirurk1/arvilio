/**
 * Shared cursor helpers for Control Plane list endpoints (createdAt + id).
 * Cursor format: `${isoCreatedAt}|${id}` (URL-safe enough for query strings).
 */

export const PLATFORM_DEFAULT_PAGE_SIZE = 25;
export const PLATFORM_MAX_PAGE_SIZE = 100;

export type PlatformPageDto<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  /** Total matching rows for the current filter (optional; omit when expensive). */
  total: number;
};

export function clampPageLimit(raw: unknown, fallback = PLATFORM_DEFAULT_PAGE_SIZE): number {
  const n = typeof raw === 'string' ? Number(raw) : typeof raw === 'number' ? raw : fallback;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), 1), PLATFORM_MAX_PAGE_SIZE);
}

export function encodeCreatedAtIdCursor(row: { createdAt: Date; id: string }): string {
  return `${row.createdAt.toISOString()}|${row.id}`;
}

export function decodeCreatedAtIdCursor(
  cursor: string | undefined | null,
): { createdAt: Date; id: string } | null {
  if (!cursor) return null;
  const sep = cursor.indexOf('|');
  if (sep <= 0) return null;
  const iso = cursor.slice(0, sep);
  const id = cursor.slice(sep + 1);
  if (!id) return null;
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime())) return null;
  return { createdAt, id };
}

/** Prisma `where` fragment for descending createdAt,id pagination (newest first). */
export function createdAtIdCursorWhereDesc(cursor: string | undefined | null) {
  const decoded = decodeCreatedAtIdCursor(cursor);
  if (!decoded) return {};
  return {
    OR: [
      { createdAt: { lt: decoded.createdAt } },
      { AND: [{ createdAt: decoded.createdAt }, { id: { lt: decoded.id } }] },
    ],
  };
}
