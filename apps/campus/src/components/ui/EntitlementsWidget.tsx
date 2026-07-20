'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
import { useCampusT } from '../../lib/cms';
import styles from './EntitlementsWidget.module.scss';

interface EntitlementsSummary {
  plan: string;
  maxActiveStudents: number | null;
  activeStudentCount: number;
  seatsRemaining: number | null;
  storage: {
    usedBytes: string;
    quotaBytes: string;
    percentUsed: number;
    overQuota: boolean;
  };
}

const BYTE_UNIT_KEYS = [
  'entitlements.bytes.b',
  'entitlements.bytes.kb',
  'entitlements.bytes.mb',
  'entitlements.bytes.gb',
  'entitlements.bytes.tb',
] as const;

function formatBytes(bytes: string, unitLabel: (i: number) => string): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n === 0) return `0 ${unitLabel(0)}`;
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), BYTE_UNIT_KEYS.length - 1);
  return `${(n / 1024 ** i).toFixed(1)} ${unitLabel(i)}`;
}

function Gauge({
  percent,
  over,
}: {
  percent: number;
  over: boolean;
}) {
  const clamped = Math.min(percent, 100);
  return (
    <div className={styles.gauge}>
      <div
        className={`${styles.gaugeBar} ${over ? styles.over : clamped > 80 ? styles.warn : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

/**
 * Compact storage + seats widget for the admin dashboard.
 * Fetches GET /api/billing/entitlements on mount; renders nothing while loading.
 */
export function EntitlementsWidget() {
  const t = useCampusT();
  const [data, setData] = useState<EntitlementsSummary | null>(null);

  useEffect(() => {
    apiClient
      .get<EntitlementsSummary>('/billing/entitlements')
      .then((r: EntitlementsSummary) => setData(r))
      .catch(() => null);
  }, []);

  if (!data) return null;

  const seatsPercent =
    data.maxActiveStudents != null
      ? Math.round((data.activeStudentCount / data.maxActiveStudents) * 100)
      : null;
  const seatsOver = seatsPercent != null && seatsPercent >= 100;
  const unitLabel = (i: number) => t(BYTE_UNIT_KEYS[i]);

  return (
    <div className={styles.widget} data-tour-anchor="dash-entitlements">
      <div className={styles.header}>
        <span className={styles.plan}>{data.plan}</span>
        <Link href="/billing" className={styles.link}>
          {t('entitlements.managePlan')}
        </Link>
      </div>

      <div className={styles.meters}>
        <div className={styles.meter}>
          <div className={styles.meterLabel}>
            <span>{t('entitlements.storage')}</span>
            <span className={data.storage.overQuota ? styles.overText : ''}>
              {formatBytes(data.storage.usedBytes, unitLabel)} /{' '}
              {formatBytes(data.storage.quotaBytes, unitLabel)}
            </span>
          </div>
          <Gauge percent={data.storage.percentUsed} over={data.storage.overQuota} />
        </div>

        {data.maxActiveStudents != null && (
          <div className={styles.meter}>
            <div className={styles.meterLabel}>
              <span>{t('entitlements.students')}</span>
              <span className={seatsOver ? styles.overText : ''}>
                {data.activeStudentCount} / {data.maxActiveStudents}
              </span>
            </div>
            <Gauge percent={seatsPercent ?? 0} over={seatsOver} />
          </div>
        )}
      </div>
    </div>
  );
}
