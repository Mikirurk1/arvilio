'use client';

import { Check, Circle, Loader2 } from 'lucide-react';
import { ProgressHeader } from '../../components/ui';
import { formatMaterialCompressionLine } from '../../lib/material-upload';
import type { MaterialSaveProgress, MaterialSaveStep } from './material-save-progress';
import styles from './MaterialSaveProgressPanel.module.scss';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  progress: MaterialSaveProgress;
  steps: MaterialSaveStep[];
};

export function MaterialSaveProgressPanel({ progress, steps }: Props) {
  const isCompressing = progress.stepPhase === 'compressing';
  const uploadDetail =
    !isCompressing && progress.uploadBytesTotal && progress.uploadBytesTotal > 0
      ? `${formatBytes(progress.uploadBytesLoaded ?? 0)} / ${formatBytes(progress.uploadBytesTotal)}`
      : null;
  const processingDetail = isCompressing
    ? 'Optimizing on server (images, audio, video, PDF)…'
    : null;

  return (
    <div className={styles.panel} role="status" aria-live="polite" aria-busy={!progress.done}>
      <div className={styles.head}>
        <p className={styles.title}>{progress.done ? 'Material saved' : 'Saving material…'}</p>
        <p className={styles.subtitle}>{progress.stepLabel}</p>
      </div>

      <ProgressHeader
        className={styles.bar}
        current={progress.overallPercent}
        total={100}
        label={`${progress.overallPercent}%`}
      />

      {uploadDetail ? <p className={styles.uploadDetail}>{uploadDetail}</p> : null}
      {processingDetail ? <p className={styles.uploadDetail}>{processingDetail}</p> : null}

      {progress.done && progress.compressionSummaries && progress.compressionSummaries.length > 0 ? (
        <ul className={styles.compressionSummary}>
          {progress.compressionSummaries.map((summary) => (
            <li key={summary.fileName}>{formatMaterialCompressionLine(summary)}</li>
          ))}
        </ul>
      ) : null}

      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = progress.done
            ? 'done'
            : stepNumber < progress.stepIndex
              ? 'done'
              : stepNumber === progress.stepIndex
                ? 'active'
                : 'pending';

          const label =
            status === 'active' && progress.stepPhase === 'compressing' && step.kind === 'compress'
              ? progress.stepLabel
              : step.label;

          return (
            <li
              key={`${step.kind}-${step.fileName ?? step.label}-${index}`}
              className={[styles.step, styles[`step_${status}`]].join(' ')}
            >
              <span className={styles.stepIcon} aria-hidden>
                {status === 'done' ? (
                  <Check size={14} />
                ) : status === 'active' ? (
                  <Loader2 size={14} className={styles.spin} />
                ) : (
                  <Circle size={10} />
                )}
              </span>
              <span className={styles.stepLabel}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
