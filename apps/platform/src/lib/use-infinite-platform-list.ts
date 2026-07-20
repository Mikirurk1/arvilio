'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { platformClientGet } from './platform-client-api';
import type { PlatformPageDto } from './platform-api';

export type InfiniteListState<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  reload: () => void;
  loadMore: () => void;
};

/**
 * Cursor-paginated list loader for Control Plane tables.
 * Resets when `filterKey` changes (serialize filters into a stable string).
 */
export function useInfinitePlatformList<T>(opts: {
  path: string;
  params: Record<string, string | number | undefined | null>;
  /** Change this to reset + refetch (e.g. JSON.stringify(filters)). */
  filterKey: string;
  enabled?: boolean;
}): InfiniteListState<T> {
  const { path, params, filterKey, enabled = true } = opts;
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const inFlight = useRef(false);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (!enabled || inFlight.current) return;
      inFlight.current = true;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const page = await platformClientGet<PlatformPageDto<T>>(path, {
          ...paramsRef.current,
          cursor: cursor ?? undefined,
        });
        setItems((prev) => (append ? [...prev, ...page.items] : page.items));
        setTotal(page.total);
        setHasMore(page.hasMore);
        setNextCursor(page.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
        if (!append) {
          setItems([]);
          setTotal(0);
          setHasMore(false);
          setNextCursor(null);
        }
      } finally {
        inFlight.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [enabled, path, filterKey, reloadToken],
  );

  useEffect(() => {
    setItems([]);
    setNextCursor(null);
    setHasMore(false);
    void fetchPage(null, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || !nextCursor) return;
    void fetchPage(nextCursor, true);
  }, [fetchPage, hasMore, loading, loadingMore, nextCursor]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  return { items, total, hasMore, nextCursor, loading, loadingMore, error, reload, loadMore };
}

/** IntersectionObserver sentinel for infinite scroll inside a scroll root. */
export function useInfiniteScrollSentinel(opts: {
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  rootRef: React.RefObject<HTMLElement | null>;
  deps?: unknown[];
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasMore, loading, loadingMore, onLoadMore, rootRef } = opts;

  useEffect(() => {
    const root = rootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore) {
          onLoadMore();
        }
      },
      { root, rootMargin: '160px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, onLoadMore, rootRef, ...(opts.deps ?? [])]);

  return sentinelRef;
}

export function useDebouncedValue(value: string, ms = 250): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
