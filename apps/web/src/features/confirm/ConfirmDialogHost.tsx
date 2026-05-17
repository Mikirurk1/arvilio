'use client';

import { useEffect } from 'react';
import { Button } from '../../components/ui';
import { useConfirmDialogStore } from '../../stores/confirm-dialog-store';
import styles from './ConfirmDialogHost.module.scss';

export function ConfirmDialogHost() {
  const open = useConfirmDialogStore((s) => s.open);
  const mode = useConfirmDialogStore((s) => s.mode);
  const title = useConfirmDialogStore((s) => s.title);
  const message = useConfirmDialogStore((s) => s.message);
  const confirmLabel = useConfirmDialogStore((s) => s.confirmLabel);
  const cancelLabel = useConfirmDialogStore((s) => s.cancelLabel);
  const variant = useConfirmDialogStore((s) => s.variant);
  const close = useConfirmDialogStore((s) => s.close);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  if (!open) return null;

  const isAlert = mode === 'alert';
  const confirmClass =
    variant === 'danger' ? styles.confirmDanger : styles.confirmPrimary;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => close(false)}
    >
      <div
        className={styles.modal}
        role={isAlert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        {message ? <p className={styles.body}>{message}</p> : null}
        <div className={styles.actions}>
          {!isAlert ? (
            <Button type="button" className={styles.cancelBtn} onClick={() => close(false)}>
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            className={confirmClass}
            onClick={() => close(true)}
            autoFocus
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
