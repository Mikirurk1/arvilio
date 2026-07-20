'use client';

import { History } from 'lucide-react';
import type { LessonBalanceLedgerEntryDto } from '@pkg/types';
import { SurfaceCard } from '../ui';
import {
  formatLedgerBalanceAfter,
  formatLedgerDelta,
  formatLedgerWhen,
  getLedgerKindMeta,
  groupLedgerByDay,
} from '../../lib/billing/ledger-display';
import styles from './LessonBalanceLedgerActivity.module.scss';

function LedgerRow({ row }: { row: LessonBalanceLedgerEntryDto }) {
  const meta = getLedgerKindMeta(row.kind);
  const when = formatLedgerWhen(row.createdAt);
  const Icon = meta.icon;
  const deltaTone = row.delta > 0 ? 'credit' : row.delta < 0 ? 'debit' : 'neutral';

  return (
    <li className={styles.row}>
      <span
        className={[styles.rowIcon, styles[`rowIcon_${meta.tone}`]].join(' ')}
        aria-hidden
      >
        <Icon size={18} />
      </span>
      <div className={styles.rowMain}>
        <span className={styles.rowTitle}>{meta.title}</span>
        {row.note ? (
          <span className={styles.rowNote}>{row.note}</span>
        ) : (
          <span className={styles.rowNote}>{meta.description}</span>
        )}
        <time className={styles.rowWhen} dateTime={row.createdAt} title={when.title}>
          {when.label}
        </time>
      </div>
      <div className={styles.rowAside}>
        <span className={[styles.delta, styles[`delta_${deltaTone}`]].join(' ')}>
          {formatLedgerDelta(row.delta)}
        </span>
        <span className={styles.balanceAfter}>{formatLedgerBalanceAfter(row.balanceAfter)}</span>
      </div>
    </li>
  );
}

export type LessonBalanceLedgerActivityProps = {
  entries: LessonBalanceLedgerEntryDto[];
  /** Show section shell even when there are no entries */
  showWhenEmpty?: boolean;
  className?: string;
};

export function LessonBalanceLedgerActivity({
  entries,
  showWhenEmpty = false,
  className,
}: LessonBalanceLedgerActivityProps) {
  if (entries.length === 0 && !showWhenEmpty) return null;

  const dayGroups = groupLedgerByDay(entries);

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(' ')}
      aria-labelledby="lesson-balance-ledger-heading"
    >
      <div className={styles.header}>
        <span className={styles.headerIcon} aria-hidden>
          <History size={20} />
        </span>
        <div className={styles.headerText}>
          <h2 id="lesson-balance-ledger-heading" className={styles.title}>
            Recent balance activity
          </h2>
          <p className={styles.subtitle}>
            Purchases, lesson charges, manual top-ups, and reversals on your prepaid balance.
          </p>
        </div>
      </div>

      <SurfaceCard className={styles.card}>
        {entries.length === 0 ? (
          <p className={styles.empty}>No balance changes yet. Top up or complete a lesson to see activity here.</p>
        ) : (
          dayGroups.map((group) => (
            <div key={group.dayKey} className={styles.dayGroup}>
              <p className={styles.dayLabel}>{group.dayLabel}</p>
              <ul className={styles.list}>
                {group.entries.map((row) => (
                  <LedgerRow key={row.id} row={row} />
                ))}
              </ul>
            </div>
          ))
        )}
      </SurfaceCard>
    </section>
  );
}
