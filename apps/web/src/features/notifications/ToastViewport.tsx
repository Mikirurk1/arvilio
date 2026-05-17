'use client';

import { AlertTriangle, CheckCircle2, CircleX, Info, X } from 'lucide-react';
import type { ToastKind } from '../../stores/notifications-store';
import { useNotificationsStore } from '../../stores/notifications-store';
import styles from './ToastViewport.module.scss';

function cardClass(kind: ToastKind) {
  const kindClass =
    kind === 'success'
      ? styles.cardSuccess
      : kind === 'warning'
        ? styles.cardWarning
        : kind === 'error'
          ? styles.cardError
          : styles.cardInfo;
  return `${styles.card} ${kindClass}`;
}

function iconClass(kind: ToastKind) {
  const kindClass =
    kind === 'success'
      ? styles.iconSuccess
      : kind === 'warning'
        ? styles.iconWarning
        : kind === 'error'
          ? styles.iconError
          : styles.iconInfo;
  return `${styles.iconWrap} ${kindClass}`;
}

function ToastIcon({ kind }: { kind: ToastKind }) {
  const size = 16;
  switch (kind) {
    case 'success':
      return <CheckCircle2 size={size} aria-hidden />;
    case 'warning':
      return <AlertTriangle size={size} aria-hidden />;
    case 'error':
      return <CircleX size={size} aria-hidden />;
    default:
      return <Info size={size} aria-hidden />;
  }
}

export function ToastViewport() {
  const toasts = useNotificationsStore((s) => s.toasts);
  const removeToast = useNotificationsStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.viewport} aria-live="polite" aria-relevant="additions removals">
      {toasts.map((toast) => (
        <div key={toast.id} className={cardClass(toast.kind)} role="status">
          <div className={styles.cardSheen} aria-hidden />
          <div className={iconClass(toast.kind)}>
            <ToastIcon kind={toast.kind} />
          </div>
          <div className={styles.content}>
            <div className={styles.titleRow}>
              <div className={styles.title}>{toast.title}</div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={14} aria-hidden />
              </button>
            </div>
            {toast.description ? (
              <div className={styles.description}>{toast.description}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
