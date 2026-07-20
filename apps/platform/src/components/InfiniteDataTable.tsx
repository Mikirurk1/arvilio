'use client';

import { Children, type ReactNode, useRef } from 'react';
import { DataTable } from './ui';
import { useInfiniteScrollSentinel } from '../lib/use-infinite-platform-list';
import styles from './InfiniteDataTable.module.scss';
import ui from './ui/ui.module.scss';

export type InfiniteDataTableProps = {
  headers: ReactNode[];
  /** Data rows only (`<tr>…</tr>`). Sentinel is appended by this component. */
  children: ReactNode;
  empty?: ReactNode;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  loadedCount: number;
  total: number;
  error?: string | null;
  className?: string;
  maxHeight?: string;
};

/**
 * DataTable inside a scroll viewport with IntersectionObserver infinite load.
 */
export function InfiniteDataTable({
  headers,
  children,
  empty = 'No rows.',
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  loadedCount,
  total,
  error,
  className,
  maxHeight = 'min(70vh, 40rem)',
}: InfiniteDataTableProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useInfiniteScrollSentinel({
    hasMore,
    loading,
    loadingMore,
    onLoadMore,
    rootRef,
    deps: [loadedCount],
  });

  const dataRows = Children.toArray(children).filter(Boolean);
  const showEmpty = !loading && dataRows.length === 0;

  return (
    <div className={className}>
      <p className={ui.mutedCopy}>
        {loading && loadedCount === 0
          ? 'Loading…'
          : `Showing ${loadedCount} of ${total}${hasMore ? ' · scroll for more' : ''}`}
      </p>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div ref={rootRef} className={styles.scroll} style={{ maxHeight }}>
        <DataTable headers={headers} empty={showEmpty ? empty : '—'}>
          {showEmpty ? null : dataRows}
          {!showEmpty && (hasMore || loadingMore) ? (
            <tr>
              <td className={styles.sentinelCell} colSpan={headers.length}>
                <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
                {loadingMore ? <span className={ui.mutedCopy}>Loading more…</span> : null}
              </td>
            </tr>
          ) : null}
        </DataTable>
      </div>
    </div>
  );
}
