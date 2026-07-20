import styles from './TrialBanner.module.scss';

/**
 * Trial countdown banner (Phase 4.5.1). Rendered when the active school is on a
 * trial. Purely informational; the actual suspend happens server-side via the
 * trial-expiry job. `daysLeft` is already clamped at 0 by the backend.
 */
export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const message =
    daysLeft <= 0
      ? 'Your free trial has ended — add a payment method to keep your school active.'
      : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial.`;

  return (
    <div className={styles.banner} role="status" aria-live="polite" data-ended={daysLeft <= 0}>
      <span>{message}</span>
    </div>
  );
}
