'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { StaffPayoutDto } from '@pkg/types';
import { Field, SectionHeader, TabPanelCard } from '../../components/ui';
import { useInfiniteScrollSentinel } from '../../hooks/use-infinite-scroll-sentinel';
import { formatMoneyMinor } from '../../lib/format-money';
import { fetchStaffPayoutHistoryPage } from '../../stores/finance-store';
import { DEFAULT_PAGE_SIZE, createIdlePaginatedSlice, type PaginatedSlice } from '../../stores/lib/paginated-slice';
import styles from './staff-payout.module.scss';

type StaffOption = {
  userId: string;
  displayName: string;
};

type StaffPayoutHistoryPanelProps = {
  rangeFrom: string;
  rangeTo: string;
  staffOptions?: StaffOption[];
  fixedUserId?: string;
  refreshToken?: number;
  title?: string;
  periodLabel?: string;
  action?: ReactNode;
  wrapInCard?: boolean;
};

export function StaffPayoutHistoryPanel({
  rangeFrom,
  rangeTo,
  staffOptions = [],
  fixedUserId,
  refreshToken = 0,
  title = 'Recent payouts',
  periodLabel,
  action,
  wrapInCard = true,
}: StaffPayoutHistoryPanelProps) {
  const [staffFilter, setStaffFilter] = useState('');
  const [page, setPage] = useState<PaginatedSlice<StaffPayoutDto>>(() =>
    createIdlePaginatedSlice<StaffPayoutDto>(),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const effectiveUserId = fixedUserId ?? (staffFilter || undefined);

  const loadInitial = useCallback(async () => {
    setPage({
      ...createIdlePaginatedSlice<StaffPayoutDto>(),
      status: 'loading',
    });
    try {
      const result = await fetchStaffPayoutHistoryPage({
        userId: effectiveUserId,
        rangeFrom,
        rangeTo,
        limit: DEFAULT_PAGE_SIZE,
      });
      setPage({
        items: result.items,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        status: 'success',
        error: null,
        loadingMore: false,
      });
    } catch (error) {
      setPage({
        ...createIdlePaginatedSlice<StaffPayoutDto>(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to load payouts',
        loadingMore: false,
      });
    }
  }, [effectiveUserId, rangeFrom, rangeTo]);

  const loadMore = useCallback(async () => {
    if (page.status !== 'success' || !page.hasMore || page.loadingMore || !page.nextCursor) {
      return;
    }
    setPage((current) => ({ ...current, loadingMore: true, error: null }));
    try {
      const result = await fetchStaffPayoutHistoryPage({
        userId: effectiveUserId,
        rangeFrom,
        rangeTo,
        cursor: page.nextCursor,
        limit: DEFAULT_PAGE_SIZE,
      });
      setPage((current) => {
        const seen = new Set(current.items.map((row) => row.id));
        const merged = [
          ...current.items,
          ...result.items.filter((row) => !seen.has(row.id)),
        ];
        return {
          items: merged,
          hasMore: result.hasMore,
          nextCursor: result.nextCursor,
          status: 'success',
          error: null,
          loadingMore: false,
        };
      });
    } catch (error) {
      setPage((current) => ({
        ...current,
        loadingMore: false,
        error: error instanceof Error ? error.message : 'Failed to load more payouts',
      }));
    }
  }, [effectiveUserId, page.nextCursor, page.hasMore, page.loadingMore, page.status, rangeFrom, rangeTo]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial, refreshToken]);

  const { sentinelRef } = useInfiniteScrollSentinel({
    scrollRef,
    hasMore: page.hasMore,
    loadingMore: page.loadingMore,
    onLoadMore: () => void loadMore(),
    disabled: page.status !== 'success',
  });

  const showStaffFilter = !fixedUserId && staffOptions.length > 0;

  const content = (
    <>
      <SectionHeader title={title} action={action} />
      <div className={styles.payoutHistoryPanel}>
        <div className={styles.payoutHistoryFilters}>
          {showStaffFilter ? (
            <div className={styles.payoutHistoryFilterField}>
              <label className={styles.label} htmlFor="payout-history-staff">
                Staff member
              </label>
              <Field
                as="select"
                id="payout-history-staff"
                className={styles.input}
                value={staffFilter}
                onChange={(event) => setStaffFilter(event.target.value)}
              >
                <option value="">All staff</option>
                {staffOptions.map((staff) => (
                  <option key={staff.userId} value={staff.userId}>
                    {staff.displayName}
                  </option>
                ))}
              </Field>
            </div>
          ) : null}
          {periodLabel ? (
            <p className={styles.payoutHistoryPeriodHint}>
              Period: <strong>{periodLabel}</strong>
            </p>
          ) : null}
        </div>

        {page.error ? <p className={styles.formError}>{page.error}</p> : null}

        <div ref={scrollRef} className={styles.payoutHistoryScroll}>
          {page.status === 'loading' && page.items.length === 0 ? (
            <p className={styles.formHint}>Loading payout history…</p>
          ) : page.items.length > 0 ? (
            <div className={styles.historyList}>
              {page.items.map((payout) => (
                <div key={payout.id} className={styles.historyItem}>
                  <span>
                    {fixedUserId ? (
                      <strong>{formatMoneyMinor(payout.amountMinor, payout.currency)}</strong>
                    ) : (
                      <>
                        <Link href={`/staff/${payout.userId}`} className={styles.staffNameLink}>
                          {payout.userDisplayName}
                        </Link>
                        {' · '}
                        <strong>{formatMoneyMinor(payout.amountMinor, payout.currency)}</strong>
                      </>
                    )}
                  </span>
                  <span>
                    {new Date(payout.paidAt).toLocaleDateString()} · by{' '}
                    {payout.createdByDisplayName}
                    {payout.note ? ` · ${payout.note}` : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : page.status === 'success' ? (
            <p className={styles.formHint}>No payouts recorded for this filter.</p>
          ) : null}

          {page.loadingMore ? (
            <p className={styles.payoutHistoryLoadingMore}>Loading more…</p>
          ) : null}
          <div ref={sentinelRef} className={styles.payoutHistorySentinel} aria-hidden />
        </div>
      </div>
    </>
  );

  if (!wrapInCard) return content;

  return <TabPanelCard>{content}</TabPanelCard>;
}
