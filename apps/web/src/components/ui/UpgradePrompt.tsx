'use client';

import Link from 'next/link';
import { ApiError } from '../../lib/api';
import styles from './UpgradePrompt.module.scss';

interface UpgradePromptProps {
  message?: string;
}

/**
 * Shown when an upload is blocked by the storage quota (API returns 413) or when a
 * feature is unavailable on the current plan (API returns 403 with featureBlocked).
 * Links the user to the billing page to upgrade their plan.
 */
export function UpgradePrompt({ message }: UpgradePromptProps) {
  return (
    <p className={styles.root} role="alert">
      {message ?? 'Storage quota exceeded.'}{' '}
      <Link href="/billing" className={styles.link}>
        Upgrade your plan →
      </Link>
    </p>
  );
}

/**
 * Returns true when the error originates from a storage-quota or seat-cap rejection
 * (HTTP 413 Payload Too Large from the upload endpoints, or the seat-cap 403 message).
 */
export function isStorageQuotaError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const msg = e.message.toLowerCase();
  return (
    msg.includes('storage quota') ||
    msg.includes('payload too large') ||
    msg.includes('quota exceeded') ||
    // API sends 413 as a status code; some API clients surface it as text
    msg.includes('413')
  );
}

/**
 * Returns true when the API returned 403 with a `featureBlocked` field — meaning the
 * current plan does not include the requested feature. Use alongside `UpgradePrompt`.
 */
export function isFeatureBlockedError(e: unknown): boolean {
  return e instanceof ApiError && e.status === 403 && Boolean(e.featureBlocked);
}
