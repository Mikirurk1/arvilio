'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@fe/ui';
import ui from './ui/ui.module.scss';
import { getPlatformPaymentMethodMeta } from './payment-method-meta';
import { PaymentMethodLogo } from './PaymentMethodLogo';
import styles from './PaymentAllowlist.module.scss';

/**
 * Platform-wide allowlist of learner payment methods campuses may enable.
 * Empty selection = no restriction.
 */
export function PaymentAllowlistEditor({
  allMethods,
  initialAllowed,
}: {
  allMethods: string[];
  initialAllowed: string[];
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<Set<string>>(new Set(initialAllowed));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const unrestricted = allowed.size === 0;

  function toggle(method: string) {
    setSaved(false);
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/platform/payment-methods', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowed: Array.from(allowed) }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <p className={ui.mutedCopy}>
        Choose which payment providers campuses may turn on for their learners. Leave none selected
        to allow every method.
      </p>
      <div className={styles.methodGrid} role="group" aria-label="Payment methods">
        {allMethods.map((method) => {
          const meta = getPlatformPaymentMethodMeta(method);
          const selected = allowed.has(method);
          return (
            <Button
              key={method}
              type="button"
              variant="bare"
              className={[styles.methodCard, selected ? styles.methodCardSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => toggle(method)}
              aria-pressed={selected}
              aria-label={meta.title}
            >
              <span className={styles.srOnly}>{meta.title}</span>
              <div className={styles.methodCardTop}>
                <span
                  className={styles.methodLogo}
                  style={{ background: meta.brandBg, color: meta.brandFg }}
                >
                  <PaymentMethodLogo method={method} className={styles.methodLogoSvg} />
                </span>
                <span className={styles.methodCheck} aria-hidden>
                  <svg className={styles.methodCheckIcon} viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <h3 className={styles.methodTitle}>{meta.title}</h3>
              <p className={styles.methodDesc}>{meta.description}</p>
              <p className={styles.methodState}>
                {unrestricted ? 'Allowed (all open)' : selected ? 'Allowed' : 'Blocked'}
              </p>
            </Button>
          );
        })}
      </div>
      <div className={ui.actionRow}>
        <Button variant="primary" disabled={pending} loading={pending} onClick={() => void save()}>
          Save allowlist
        </Button>
        {saved ? <span className={`${ui.inlineMsg} ${ui.inlineOk}`}>Saved</span> : null}
        {error ? <span className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</span> : null}
      </div>
    </div>
  );
}
