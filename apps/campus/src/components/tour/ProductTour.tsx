'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { Button } from '../ui';
import { Mascot } from '../mascot/Mascot';
import type { MascotPose } from '../../lib/mascot-capability';
import { TOUR_STEPS } from './tourSteps';
import styles from './ProductTour.module.scss';

/** Map a tour step to an Arvi pose (used by the GLB clips when present). */
function poseForStep(id: string): MascotPose {
  if (id === 'welcome') return 'greet';
  if (id === 'done') return 'celebrate';
  return 'point';
}

/**
 * First-login product tour (Phase 4.5.4). Data-driven (see `tourSteps.ts`),
 * dependency-free. Shows once per user — gated by `GET /api/onboarding/tour`;
 * Finish/Skip → `POST /api/onboarding/tour/complete`. The mascot is a 2D
 * placeholder (`data-mascot`) so the 3D asset can drop in without markup changes.
 */
export function ProductTour() {
  const pathname = usePathname();
  const onOnboardingRoute = pathname?.startsWith('/onboarding') ?? false;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) track({ name: 'tour_step_viewed', stepIndex: index });
  }, [open, index]);

  useEffect(() => {
    // The tour starts after the onboarding wizard, not on top of it.
    if (onOnboardingRoute) return;
    let active = true;
    apiClient
      .get<{ completed: boolean }>('/onboarding/tour')
      .then((state) => {
        if (active && !state.completed) setOpen(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [onOnboardingRoute]);

  if (!open) return null;

  const step = TOUR_STEPS[index];
  const isFirst = index === 0;
  const isLast = index === TOUR_STEPS.length - 1;

  async function finish(skipped = false) {
    setClosing(true);
    setOpen(false);
    await apiClient.post('/onboarding/tour/complete').catch(() => undefined);
    if (skipped) {
      track({ name: 'tour_skipped', stepIndex: index });
    } else {
      track({ name: 'tour_completed' });
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Product tour">
      <div className={styles.card}>
        <div className={styles.mascot} data-mascot aria-hidden>
          <Mascot pose={poseForStep(step.id)} size={56} />
        </div>
        <div className={styles.body}>
          <div className={styles.progress}>
            {index + 1} / {TOUR_STEPS.length}
            {step.area ? <span className={styles.area}> · {step.area}</span> : null}
          </div>
          <h2 className={styles.title}>{step.title}</h2>
          <p className={styles.text}>{step.body}</p>

          <div className={styles.actions}>
            <Button variant="ghost" disabled={closing} onClick={() => void finish(true)}>
              Skip
            </Button>
            <div className={styles.nav}>
              {!isFirst ? (
                <Button variant="default" disabled={closing} onClick={() => setIndex((i) => i - 1)}>
                  Back
                </Button>
              ) : null}
              {isLast ? (
                <Button variant="primary" disabled={closing} onClick={() => void finish()}>
                  Finish
                </Button>
              ) : (
                <Button variant="primary" disabled={closing} onClick={() => setIndex((i) => i + 1)}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
