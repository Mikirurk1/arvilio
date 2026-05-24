'use client';

import { useCallback, useEffect, useRef } from 'react';

type Options = {
  scrollRef: React.RefObject<HTMLElement | null>;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  disabled?: boolean;
  rootMargin?: string;
};

/**
 * Observes a bottom sentinel inside `scrollRef` and calls `onLoadMore` when visible.
 */
export function useInfiniteScrollSentinel({
  scrollRef,
  hasMore,
  loadingMore,
  onLoadMore,
  disabled = false,
  rootMargin = '120px',
}: Options) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (disabled || !hasMore || loadingMore) return;
    onLoadMore();
  }, [disabled, hasMore, loadingMore, onLoadMore]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { root, rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [scrollRef, disabled, handleLoadMore, rootMargin]);

  return { sentinelRef };
}
