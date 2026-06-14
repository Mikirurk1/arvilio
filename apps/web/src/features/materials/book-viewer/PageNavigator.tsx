'use client';

import { useEffect, useState } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import styles from './book-viewer.module.scss';

type Props = {
  pageIndex: number;
  pageCount: number;
  disabled?: boolean;
  onChange: (pageIndex: number) => void;
};

export function PageNavigator({ pageIndex, pageCount, disabled = false, onChange }: Props) {
  const [draft, setDraft] = useState(String(pageIndex + 1));

  useEffect(() => {
    setDraft(String(pageIndex + 1));
  }, [pageIndex]);

  const commitDraft = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed)) {
      setDraft(String(pageIndex + 1));
      return;
    }
    onChange(Math.max(0, Math.min(pageCount - 1, parsed - 1)));
  };

  return (
    <div className={styles.pageNavigator}>
      <Button
        type="button"
        variant="ghost"
        className={styles.pageBtn}
        disabled={disabled || pageIndex <= 0}
        aria-label="First page"
        onClick={() => onChange(0)}
      >
        <ChevronsLeft size={16} aria-hidden />
      </Button>
      <form
        className={styles.pageJumpForm}
        onSubmit={(event) => {
          event.preventDefault();
          commitDraft();
        }}
      >
        <label className={styles.pageJumpLabel}>
          <span className={styles.srOnly}>Page number</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            className={styles.pageJumpInput}
            value={draft}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
          />
        </label>
        <span className={styles.pageJumpTotal}>/ {pageCount}</span>
      </form>
      <Button
        type="button"
        variant="ghost"
        className={styles.pageBtn}
        disabled={disabled || pageIndex >= pageCount - 1}
        aria-label="Last page"
        onClick={() => onChange(pageCount - 1)}
      >
        <ChevronsRight size={16} aria-hidden />
      </Button>
    </div>
  );
}
