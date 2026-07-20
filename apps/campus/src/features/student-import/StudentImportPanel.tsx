'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, SurfaceCard, EmptyStateCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { apiClient, ApiError } from '../../lib/api';
import styles from './StudentImportPanel.module.scss';

interface ImportRow {
  line: number;
  email: string;
  displayName: string;
}

interface ImportRowError {
  line: number;
  email: string;
  error: string;
}

interface ImportPreviewDto {
  valid: ImportRow[];
  invalid: ImportRowError[];
  seatCapRemaining: number | null;
  wouldExceedCap: boolean;
}

interface ImportConfirmDto {
  created: number;
  skipped: number;
  failed: Array<{ email: string; error: string }>;
}

type Stage = 'idle' | 'previewing' | 'preview' | 'confirming' | 'done';

const CSV_EXAMPLE = `email,fullName
alice@example.com,Alice Smith
bob@example.com,Bob Jones`;

export function StudentImportPanel() {
  const t = useCampusT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [preview, setPreview] = useState<ImportPreviewDto | null>(null);
  const [result, setResult] = useState<ImportConfirmDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState('');

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const text = await file.text();
      setCsvText(text);
      setStage('previewing');
      setError(null);
      try {
        const data = await apiClient.post<ImportPreviewDto>(
          '/admin/users/import/preview',
          { csv: text },
        );
        setPreview(data);
        setStage('preview');
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t('studentImport.previewFailed'));
        setStage('idle');
      }
      // reset input so same file can be re-selected
      e.target.value = '';
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!preview) return;
    setStage('confirming');
    setError(null);
    try {
      const rows = preview.wouldExceedCap
        ? preview.valid.slice(0, preview.seatCapRemaining ?? preview.valid.length)
        : preview.valid;
      const data = await apiClient.post<ImportConfirmDto>(
        '/admin/users/import/confirm',
        { rows },
      );
      setResult(data);
      setStage('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('studentImport.importFailed'));
      setStage('preview');
    }
  }, [preview, t]);

  const handleReset = useCallback(() => {
    setStage('idle');
    setPreview(null);
    setResult(null);
    setError(null);
    setFileName(null);
    setCsvText('');
  }, []);

  return (
    <div className={styles.root} data-tour-anchor="admin-import">
      <SurfaceCard>
        <div className={styles.header}>
          <Upload size={18} aria-hidden />
          <span>{t('studentImport.title')}</span>
        </div>

        <p className={styles.hint} data-tour-anchor="admin-seats-hint">
          {t('studentImport.hint')}
        </p>

        <details className={styles.example}>
          <summary>{t('studentImport.exampleTitle')}</summary>
          <pre className={styles.code}>{CSV_EXAMPLE}</pre>
        </details>

        {error && <div className={styles.errorBox}>{error}</div>}

        {/* ── Idle / upload ── */}
        {(stage === 'idle' || stage === 'previewing') && (
          <div className={styles.uploadArea}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className={styles.hiddenInput}
              onChange={(e) => void handleFileChange(e)}
            />
            <Button
              type="button"
              startIcon={<Upload size={14} />}
              loading={stage === 'previewing'}
              loadingLabel={t('studentImport.parsing')}
              onClick={() => fileRef.current?.click()}
            >
              {fileName
                ? t('studentImport.reupload', { fileName })
                : t('studentImport.chooseFile')}
            </Button>
            {fileName && stage !== 'previewing' && (
              <span className={styles.fileName}>{fileName}</span>
            )}
          </div>
        )}

        {/* ── Preview ── */}
        {stage === 'preview' && preview && (
          <div className={styles.preview}>
            <div className={styles.previewStats}>
              <span className={styles.statGood}>
                <CheckCircle size={14} /> {t('studentImport.validRows', { count: preview.valid.length })}
              </span>
              {preview.invalid.length > 0 && (
                <span className={styles.statWarn}>
                  <AlertTriangle size={14} /> {t('studentImport.invalidRows', { count: preview.invalid.length })}
                </span>
              )}
              {preview.seatCapRemaining !== null && (
                <span className={preview.wouldExceedCap ? styles.statWarn : styles.statGood}>
                  {t('studentImport.seatsRemaining', { count: preview.seatCapRemaining })}
                </span>
              )}
            </div>

            {preview.wouldExceedCap && (
              <div className={styles.warnBox}>
                {t('studentImport.capWarning', {
                  remaining: preview.seatCapRemaining ?? 0,
                  rows: preview.valid.length,
                  imported: preview.seatCapRemaining ?? preview.valid.length,
                })}
              </div>
            )}

            {preview.valid.length > 0 && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('studentImport.preview.col.number')}</th>
                    <th>{t('studentImport.preview.col.email')}</th>
                    <th>{t('studentImport.preview.col.name')}</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.valid.slice(0, 10).map((r) => (
                    <tr key={r.line}>
                      <td>{r.line}</td>
                      <td>{r.email}</td>
                      <td>{r.displayName || '—'}</td>
                    </tr>
                  ))}
                  {preview.valid.length > 10 && (
                    <tr>
                      <td colSpan={3} className={styles.moreRows}>
                        {t('studentImport.moreRows', { count: preview.valid.length - 10 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {preview.invalid.length > 0 && (
              <details className={styles.errDetails}>
                <summary>{t('studentImport.errorRowsSummary', { count: preview.invalid.length })}</summary>
                <ul className={styles.errList}>
                  {preview.invalid.map((r) => (
                    <li key={r.line}>
                      {t('studentImport.errorLine', {
                        line: r.line,
                        email: r.email || t('studentImport.emptyEmail'),
                        error: r.error,
                      })}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {preview.valid.length === 0 ? (
              <EmptyStateCard
                title={t('studentImport.noValidRowsTitle')}
                description={t('studentImport.noValidRowsDesc')}
              />
            ) : (
              <div className={styles.actions}>
                <Button variant="ghost" onClick={handleReset}>
                  {t('studentImport.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirm()}
                >
                  {t('studentImport.importCount', {
                    count: Math.min(
                      preview.valid.length,
                      preview.seatCapRemaining ?? preview.valid.length,
                    ),
                  })}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Confirming ── */}
        {stage === 'confirming' && (
          <div className={styles.confirming}>
            {t('studentImport.importing')}
          </div>
        )}

        {/* ── Done ── */}
        {stage === 'done' && result && (
          <div className={styles.done}>
            <div className={styles.resultRow}>
              <CheckCircle size={18} className={styles.successIcon} />
              <strong>{t('studentImport.createdCount', { count: result.created })}</strong>
              {result.skipped > 0 && (
                <span className={styles.skipped}>
                  {t('studentImport.skippedCount', { count: result.skipped })}
                </span>
              )}
            </div>
            {result.failed.length > 0 && (
              <details className={styles.errDetails}>
                <summary>{t('studentImport.failedCount', { count: result.failed.length })}</summary>
                <ul className={styles.errList}>
                  {result.failed.map((f) => (
                    <li key={f.email}><strong>{f.email}</strong> — {f.error}</li>
                  ))}
                </ul>
              </details>
            )}
            <Button variant="ghost" onClick={handleReset}>
              {t('studentImport.importAnother')}
            </Button>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
