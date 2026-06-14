'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultCustomStatsDateKeys, utcDateKey } from '@pkg/types';
import type { StatsRange } from '@pkg/types';
import { RefreshCw } from 'lucide-react';
import { StatsRangeFilter } from '../../components/statistics/StatsRangeFilter';
import { Button, EmptyStateCard, PageHeader } from '../../components/ui';
import { StaffSummaryCard } from '../../features/staff-payout';
import { useOptionalAuth } from '../../lib/auth-context';
import { canRoleAccessPathname } from '../../lib/auth/route-policy';
import { useActiveRoleKey } from '../../lib/active-user';
import { useFinanceStore } from '../../stores/finance-store';
import styles from './page.module.scss';

export default function StaffRosterPage() {
  const auth = useOptionalAuth();
  const roleKey = useActiveRoleKey();
  const currentUserId = auth?.user?.id;
  const canLoadFinance = Boolean(auth.user) && canRoleAccessPathname('/staff', roleKey);
  const overviewSlice = useFinanceStore((s) => s.overview);
  const fetchOverview = useFinanceStore((s) => s.fetchOverview);
  const [range, setRange] = useState<StatsRange>('month');
  const [customDateFrom, setCustomDateFrom] = useState(() => defaultCustomStatsDateKeys().from);
  const [customDateTo, setCustomDateTo] = useState(() => defaultCustomStatsDateKeys().to);
  const customDateMax = utcDateKey(new Date());

  const load = useCallback(async () => {
    await fetchOverview({
      range,
      rangeFrom: range === 'custom' ? customDateFrom : undefined,
      rangeTo: range === 'custom' ? customDateTo : undefined,
    });
  }, [customDateFrom, customDateTo, fetchOverview, range]);

  useEffect(() => {
    if (!canLoadFinance) return;
    void load();
  }, [canLoadFinance, load]);

  const handleCustomDateFromChange = (value: string) => {
    setCustomDateFrom(value);
    if (value && customDateTo && value > customDateTo) {
      setCustomDateTo(value);
    }
  };

  const handleCustomDateToChange = (value: string) => {
    setCustomDateTo(value);
    if (value && customDateFrom && value < customDateFrom) {
      setCustomDateFrom(value);
    }
  };

  const overview = overviewSlice.data;
  const staffRows = useMemo(
    () =>
      overview?.staff.filter((row) => row.userId !== currentUserId) ?? [],
    [currentUserId, overview?.staff],
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.header}
        title="Staff"
        subtitle="Teachers and admins — open a profile to adjust compensation, review earnings, and view lesson statistics."
      />

      <div className={styles.toolbar}>
        <StatsRangeFilter
          range={range}
          onRangeChange={setRange}
          includeCustom
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          customDateMax={customDateMax}
          onCustomDateFromChange={handleCustomDateFromChange}
          onCustomDateToChange={handleCustomDateToChange}
          ariaLabel="Staff period"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => void load()}
          disabled={overviewSlice.status === 'loading'}
        >
          <RefreshCw size={14} aria-hidden />
          Refresh
        </Button>
      </div>

      {overviewSlice.status === 'error' ? (
        <EmptyStateCard
          title="Could not load staff roster"
          description={overviewSlice.error ?? 'Unknown error'}
        />
      ) : null}

      {overviewSlice.status === 'loading' && !overview ? (
        <p className={styles.hint}>Loading staff…</p>
      ) : null}

      {overview && staffRows.length === 0 ? (
        <EmptyStateCard
          title="No staff members found"
          description="No other teachers or admins in this period."
        />
      ) : null}

      {staffRows.length > 0 ? (
        <div className={styles.grid}>
          {staffRows.map((row) => (
            <StaffSummaryCard key={row.userId} row={row} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
