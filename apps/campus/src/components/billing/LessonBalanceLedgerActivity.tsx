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
import { useCampusI18n, useCampusT } from '../../lib/cms';
import styles from './LessonBalanceLedgerActivity.module.scss';

function LedgerRow({ row }: { row: LessonBalanceLedgerEntryDto }) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const meta = getLedgerKindMeta(row.kind, t);
  const when = formatLedgerWhen(row.createdAt, locale, {
    today: t('payment.ledger.today'),
    yesterday: t('payment.ledger.yesterday'),
  });
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
          {formatLedgerDelta(row.delta, t)}
        </span>
        <span className={styles.balanceAfter}>{formatLedgerBalanceAfter(row.balanceAfter, t)}</span>
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
  const t = useCampusT();
  const { locale } = useCampusI18n();

  if (entries.length === 0 && !showWhenEmpty) return null;

  const dayGroups = groupLedgerByDay(entries, locale, {
    today: t('payment.ledger.today'),
    yesterday: t('payment.ledger.yesterday'),
  });

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
            {t('payment.ledger.title')}
          </h2>
          <p className={styles.subtitle}>{t('payment.ledger.subtitle')}</p>
        </div>
      </div>

      <SurfaceCard className={styles.card}>
        {entries.length === 0 ? (
          <p className={styles.empty}>{t('payment.ledger.empty')}</p>
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
