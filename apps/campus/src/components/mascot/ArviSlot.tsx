'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Mascot } from './Mascot';
import { useArvi } from './useArvi';
import type { MascotPose } from '../../lib/mascot-capability';
import styles from './ArviSlot.module.scss';

type ArviSlotProps = {
  /** Override context pose (inline / auth / empty-state). */
  pose?: MascotPose;
  size?: number;
  /** Corner dock (default) vs inline in flow. */
  variant?: 'corner' | 'inline';
  /** Skip IntersectionObserver lazy mount (always render). */
  eager?: boolean;
  className?: string;
  /** Decorative by default; set false only when Arvi is the sole content cue. */
  decorative?: boolean;
  /** Enable click / keyboard to open assistant (corner dock). */
  interactive?: boolean;
  onActivate?: () => void;
  ariaLabel?: string;
};

/**
 * Global / inline Arvi mount point (B7). Corner variant docks bottom-right and
 * follows `useArvi()` pose; pass `pose` to pin (auth greet, empty sleep, etc.).
 * Lazy: waits until near viewport unless `eager`.
 */
export function ArviSlot({
  pose: poseProp,
  size = 72,
  variant = 'corner',
  eager = false,
  className,
  decorative = true,
  interactive = false,
  onActivate,
  ariaLabel,
}: ArviSlotProps) {
  const { pose: contextPose } = useArvi();
  const pose = poseProp ?? contextPose;
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager) {
      setVisible(true);
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '80px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  const classes = [
    styles.slot,
    variant === 'corner' ? styles.corner : styles.inline,
    interactive ? styles.interactive : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onActivate) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      ref={rootRef}
      className={classes}
      data-arvi-slot={variant}
      data-arvi-interactive={interactive ? 'true' : undefined}
      {...(decorative && !interactive
        ? { 'aria-hidden': true as const }
        : {
            role: interactive ? ('button' as const) : undefined,
            tabIndex: interactive ? 0 : undefined,
            'aria-label': interactive ? ariaLabel : undefined,
            onClick: interactive ? onActivate : undefined,
            onKeyDown: interactive ? onKeyDown : undefined,
          })}
    >
      {visible ? <Mascot pose={pose} size={size} /> : null}
    </div>
  );
}
