'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/api';
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

function formatBytes(bytes: string): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  return `${(n / 1024 ** i).toFixed(1)} ${units[i]}`;
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

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.plan}>{data.plan}</span>
        <Link href="/billing" className={styles.link}>
          Manage plan
        </Link>
      </div>

      <div className={styles.meters}>
        {/* Storage */}
        <div className={styles.meter}>
          <div className={styles.meterLabel}>
            <span>Storage</span>
            <span className={data.storage.overQuota ? styles.overText : ''}>
              {formatBytes(data.storage.usedBytes)} / {formatBytes(data.storage.quotaBytes)}
            </span>
          </div>
          <Gauge percent={data.storage.percentUsed} over={data.storage.overQuota} />
        </div>

        {/* Seats */}
        {data.maxActiveStudents != null && (
          <div className={styles.meter}>
            <div className={styles.meterLabel}>
              <span>Students</span>
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
