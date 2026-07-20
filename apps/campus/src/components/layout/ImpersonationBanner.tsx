'use client';

import { useState } from 'react';
import { Button } from '../ui';
import { apiClient } from '../../lib/api';
import styles from './ImpersonationBanner.module.scss';

/**
 * Mandatory "you are impersonating" banner (Phase 4 / Gate 4, ADR-009). Rendered
 * whenever the resolved session carries an impersonation claim. Stopping calls the
 * AuthGuard-only stop endpoint (the session is the impersonated school user) and
 * reloads so the operator's own refresh re-issues their session.
 */
export function ImpersonationBanner({ schoolId }: { schoolId: string }) {
  const [stopping, setStopping] = useState(false);

  async function onStop() {
    setStopping(true);
    try {
      await apiClient.post('/auth/impersonate/stop');
    } catch {
      // best-effort: even if the call fails, reloading drops the short-lived token
    }
    window.location.reload();
  }

  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <span className={styles.text}>
        Impersonating school <strong>{schoolId}</strong> — actions are performed as this school.
      </span>
      <Button
        variant="default"
        loading={stopping}
        loadingLabel="Stopping…"
        onClick={() => void onStop()}
      >
        Stop impersonating
      </Button>
    </div>
  );
}
