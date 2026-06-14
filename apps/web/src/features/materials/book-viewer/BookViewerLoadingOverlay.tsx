'use client';

import type { PdfLoadingProgress } from './pdf-client';
import styles from './book-viewer.module.scss';

type Props = {
  visible: boolean;
  label: string;
  progress: PdfLoadingProgress | null;
  error?: string | null;
  annotationsLoading?: boolean;
};

export function BookViewerLoadingOverlay({
  visible,
  label,
  progress,
  error = null,
  annotationsLoading = false,
}: Props) {
  if (!visible) return null;

  const percent = progress?.percent;
  const indeterminate = !error && (percent == null || percent <= 0);

  return (
    <div className={styles.loadingOverlay} role="status" aria-live="polite" aria-busy={!error}>
      <div className={styles.loadingCard}>
        <p className={styles.loadingLabel}>{label}</p>
        {error ? (
          <p className={styles.loadingError}>{error}</p>
        ) : (
          <>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={indeterminate ? undefined : (percent ?? undefined)}
            >
              <div
                className={[styles.progressFill, indeterminate ? styles.progressIndeterminate : ''].join(' ')}
                style={indeterminate ? undefined : { width: `${percent}%` }}
              />
            </div>
            {percent != null && percent > 0 ? (
              <p className={styles.loadingPercent}>{percent}%</p>
            ) : (
              <p className={styles.loadingPercent}>Preparing…</p>
            )}
          </>
        )}
        {annotationsLoading ? (
          <p className={styles.loadingSubtext}>Loading notes…</p>
        ) : null}
      </div>
    </div>
  );
}
