'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, SurfaceCard, EmptyStateCard } from '../../components/ui';
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
        setError(err instanceof ApiError ? err.message : 'Preview failed');
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
      setError(err instanceof ApiError ? err.message : 'Import failed');
      setStage('preview');
    }
  }, [preview]);

  const handleReset = useCallback(() => {
    setStage('idle');
    setPreview(null);
    setResult(null);
    setError(null);
    setFileName(null);
    setCsvText('');
  }, []);

  return (
    <div className={styles.root}>
      <SurfaceCard>
        <div className={styles.header}>
          <Upload size={18} aria-hidden />
          <span>Import students from CSV</span>
        </div>

        <p className={styles.hint}>
          Upload a CSV with columns <code>email</code> and <code>fullName</code>.
          Existing accounts are skipped; welcome emails are sent to new accounts.
        </p>

        <details className={styles.example}>
          <summary>CSV format example</summary>
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
              loadingLabel="Parsing…"
              onClick={() => fileRef.current?.click()}
            >
              {fileName ? `Re-upload (${fileName})` : 'Choose CSV file'}
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
                <CheckCircle size={14} /> {preview.valid.length} valid
              </span>
              {preview.invalid.length > 0 && (
                <span className={styles.statWarn}>
                  <AlertTriangle size={14} /> {preview.invalid.length} invalid (will be skipped)
                </span>
              )}
              {preview.seatCapRemaining !== null && (
                <span className={preview.wouldExceedCap ? styles.statWarn : styles.statGood}>
                  {preview.seatCapRemaining} seat{preview.seatCapRemaining === 1 ? '' : 's'} remaining
                </span>
              )}
            </div>

            {preview.wouldExceedCap && (
              <div className={styles.warnBox}>
                Your plan has {preview.seatCapRemaining} seat{preview.seatCapRemaining === 1 ? '' : 's'} remaining but
                the CSV has {preview.valid.length} rows. Only the first {preview.seatCapRemaining} will be imported.
                Upgrade your plan to import all rows.
              </div>
            )}

            {preview.valid.length > 0 && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Name</th>
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
                        …and {preview.valid.length - 10} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {preview.invalid.length > 0 && (
              <details className={styles.errDetails}>
                <summary>{preview.invalid.length} rows with errors (will be skipped)</summary>
                <ul className={styles.errList}>
                  {preview.invalid.map((r) => (
                    <li key={r.line}>
                      Line {r.line}: <strong>{r.email || '(empty)'}</strong> — {r.error}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {preview.valid.length === 0 ? (
              <EmptyStateCard title="No valid rows" description="Fix the errors and upload again." />
            ) : (
              <div className={styles.actions}>
                <Button variant="ghost" onClick={handleReset}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleConfirm()}
                >
                  Import {Math.min(
                    preview.valid.length,
                    preview.seatCapRemaining ?? preview.valid.length,
                  )} student{preview.valid.length === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Confirming ── */}
        {stage === 'confirming' && (
          <div className={styles.confirming}>
            Importing… please wait.
          </div>
        )}

        {/* ── Done ── */}
        {stage === 'done' && result && (
          <div className={styles.done}>
            <div className={styles.resultRow}>
              <CheckCircle size={18} className={styles.successIcon} />
              <strong>{result.created} student{result.created === 1 ? '' : 's'} created</strong>
              {result.skipped > 0 && (
                <span className={styles.skipped}>{result.skipped} skipped (already exist or seat cap)</span>
              )}
            </div>
            {result.failed.length > 0 && (
              <details className={styles.errDetails}>
                <summary>{result.failed.length} failed</summary>
                <ul className={styles.errList}>
                  {result.failed.map((f) => (
                    <li key={f.email}><strong>{f.email}</strong> — {f.error}</li>
                  ))}
                </ul>
              </details>
            )}
            <Button variant="ghost" onClick={handleReset}>
              Import another file
            </Button>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
