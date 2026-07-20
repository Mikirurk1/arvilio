'use client';

import type { StatsRange } from '@pkg/types';
import { Field, SegmentedControl } from '../ui';
import { useCampusT } from '../../lib/cms';
import styles from './StatisticsDashboard.module.scss';

type StatsRangeFilterProps = {
  range: StatsRange;
  onRangeChange: (range: StatsRange) => void;
  includeCustom?: boolean;
  customDateFrom?: string;
  customDateTo?: string;
  onCustomDateFromChange?: (value: string) => void;
  onCustomDateToChange?: (value: string) => void;
  /** Upper bound for date inputs (today, UTC). */
  customDateMax?: string;
  ariaLabel?: string;
  preventScrollOnPointerDown?: boolean;
  className?: string;
};

export function StatsRangeFilter({
  range,
  onRangeChange,
  includeCustom = false,
  customDateFrom,
  customDateTo,
  onCustomDateFromChange,
  onCustomDateToChange,
  customDateMax,
  ariaLabel = 'Statistics range',
  preventScrollOnPointerDown = false,
  className,
}: StatsRangeFilterProps) {
  const t = useCampusT();
  const rangeOptions = [
    { value: 'week' as const, label: t('stats.range.week') },
    { value: 'month' as const, label: t('stats.range.month') },
    { value: 'quarter' as const, label: t('stats.range.quarter') },
    { value: 'year' as const, label: t('stats.range.year') },
    ...(includeCustom ? [{ value: 'custom' as const, label: t('stats.range.custom') }] : []),
  ];

  const customRangeControl =
    includeCustom && range === 'custom' && customDateFrom != null && customDateTo != null ? (
      <div className={styles.customRangeRow}>
        <Field
          type="date"
          label={t('stats.range.from')}
          rootClassName={styles.customRangeFieldRoot}
          labelClassName={styles.customRangeLabel}
          className={[styles.customRangeTrigger, styles.customRangeField].filter(Boolean).join(' ')}
          value={customDateFrom}
          max={customDateTo}
          onChange={(event) => onCustomDateFromChange?.(event.target.value)}
        />
        <span className={styles.customDateSep} aria-hidden>
          –
        </span>
        <Field
          type="date"
          label={t('stats.range.to')}
          rootClassName={styles.customRangeFieldRoot}
          labelClassName={styles.customRangeLabel}
          className={[styles.customRangeTrigger, styles.customRangeField].filter(Boolean).join(' ')}
          value={customDateTo}
          min={customDateFrom}
          max={customDateMax}
          onChange={(event) => onCustomDateToChange?.(event.target.value)}
        />
      </div>
    ) : null;

  return (
    <div className={[styles.rangeFilterGroup, className].filter(Boolean).join(' ')}>
      <SegmentedControl
        className={styles.rangeSwitch}
        ariaLabel={ariaLabel || t('stats.range.aria')}
        value={range}
        onValueChange={(value) => onRangeChange(value as StatsRange)}
        optionClassName={styles.rangeBtn}
        activeOptionClassName={styles.rangeBtnActive}
        preventScrollOnPointerDown={preventScrollOnPointerDown}
        options={rangeOptions}
      />
      {customRangeControl}
    </div>
  );
}
