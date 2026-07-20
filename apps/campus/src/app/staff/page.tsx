'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultCustomStatsDateKeys, utcDateKey } from '@pkg/types';
import type { StatsRange } from '@pkg/types';
import { RefreshCw } from 'lucide-react';
import { StatsRangeFilter } from '../../components/statistics/StatsRangeFilter';
import { Button, EmptyStateCard, PageHeader } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { StaffSummaryCard } from '../../features/staff-payout';
import { useOptionalAuth } from '../../lib/auth-context';
import { canRoleAccessPathname } from '../../lib/auth/route-policy';
import { useActiveRoleKey } from '../../lib/active-user';
import { useFinanceStore } from '../../stores/finance-store';
import styles from './page.module.scss';

export default function StaffRosterPage() {
  const t = useCampusT();
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
        title={t('staff.title')}
        subtitle={t('staff.subtitle')}
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
          ariaLabel={t('staff.periodAria')}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => void load()}
          disabled={overviewSlice.status === 'loading'}
        >
          <RefreshCw size={14} aria-hidden />
          {t('staff.refresh')}
        </Button>
      </div>

      {overviewSlice.status === 'error' ? (
        <EmptyStateCard
          title={t('staff.loadError')}
          description={overviewSlice.error ?? t('staff.unknownError')}
        />
      ) : null}

      {overviewSlice.status === 'loading' && !overview ? (
        <p className={styles.hint}>{t('staff.loading')}</p>
      ) : null}

      {overview && staffRows.length === 0 ? (
        <EmptyStateCard
          title={t('staff.emptyTitle')}
          description={t('staff.emptyDesc')}
        />
      ) : null}

      {staffRows.length > 0 ? (
        <div className={styles.grid} data-tour-anchor="staff-roster">
          {staffRows.map((row) => (
            <StaffSummaryCard key={row.userId} row={row} />
          ))}
        </div>
      ) : (
        <div data-tour-anchor="staff-roster" hidden aria-hidden />
      )}
    </div>
  );
}
