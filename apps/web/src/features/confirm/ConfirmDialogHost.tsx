'use client';

import { useEffect } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';
import { BodyPortal, Button } from '../../components/ui';
import { useConfirmDialogStore } from '../../stores/confirm-dialog-store';
import styles from './ConfirmDialogHost.module.scss';

export function ConfirmDialogHost() {
  const open = useConfirmDialogStore((s) => s.open);
  const mode = useConfirmDialogStore((s) => s.mode);
  const title = useConfirmDialogStore((s) => s.title);
  const message = useConfirmDialogStore((s) => s.message);
  const confirmLabel = useConfirmDialogStore((s) => s.confirmLabel);
  const cancelLabel = useConfirmDialogStore((s) => s.cancelLabel);
  const loadingLabel = useConfirmDialogStore((s) => s.loadingLabel);
  const variant = useConfirmDialogStore((s) => s.variant);
  const onConfirm = useConfirmDialogStore((s) => s.onConfirm);
  const confirming = useConfirmDialogStore((s) => s.confirming);
  const setConfirming = useConfirmDialogStore((s) => s.setConfirming);
  const close = useConfirmDialogStore((s) => s.close);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirming) close(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, close, confirming]);

  if (!open) return null;

  const isAlert = mode === 'alert';
  const confirmClass =
    variant === 'danger' ? styles.confirmDanger : styles.confirmPrimary;
  const badgeClass =
    variant === 'danger' ? styles.badgeDanger : styles.badgeDefault;

  const handleConfirm = async () => {
    if (!onConfirm) {
      close(true);
      return;
    }
    setConfirming(true);
    try {
      await onConfirm();
      close(true);
    } catch {
      // Caller shows toast; keep dialog open for retry.
    } finally {
      setConfirming(false);
    }
  };

  return (
    <BodyPortal>
      <div
        className={styles.overlay}
        role="presentation"
        onClick={() => {
          if (!confirming) close(false);
        }}
      >
        <div
          className={styles.modal}
          role={isAlert ? 'alertdialog' : 'dialog'}
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <span className={`${styles.badge} ${badgeClass}`}>
              {variant === 'danger' ? <AlertTriangle size={14} aria-hidden /> : <CircleAlert size={14} aria-hidden />}
              {variant === 'danger' ? 'Danger action' : 'Confirmation'}
            </span>
            <h2 id="confirm-dialog-title" className={styles.title}>
              {title}
            </h2>
          </div>
          {message ? <p className={styles.body}>{message}</p> : null}
          <div className={styles.actions}>
            {!isAlert ? (
              <Button
                type="button"
                className={styles.cancelBtn}
                disabled={confirming}
                onClick={() => close(false)}
              >
                {cancelLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              className={confirmClass}
              loading={confirming}
              loadingLabel={loadingLabel}
              onClick={handleConfirm}
              autoFocus
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
}
