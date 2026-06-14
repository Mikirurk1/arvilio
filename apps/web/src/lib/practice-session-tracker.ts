'use client';

import { useEffect, useRef } from 'react';
import type { RecordPracticeSessionRequestDto } from '@pkg/types';
import { usePracticeStore } from '../stores/practice-store';

export const PRACTICE_SESSION_LOGGED_EVENT = 'practice-session-logged';

/** Ignore very short visits (mis-clicks, instant back). */
export const MIN_PRACTICE_SESSION_MS = 30_000;

/** Pause engaged-time accumulation after this idle period (games, quiz, vocabulary play). */
export const DEFAULT_PRACTICE_IDLE_TIMEOUT_MS = 60_000;

export type PracticeSessionKind = RecordPracticeSessionRequestDto['kind'];

export type PracticeSessionTrackerOptions = {
  /**
   * `false` — count wall-clock time while active (e.g. speaking aloud without clicks).
   * `number` — count only engaged time; pause after this many ms without input. Default 60s.
   */
  idleTimeoutMs?: number | false;
  /** Pause engaged time when the tab is hidden. Default true when idle tracking is on. */
  pauseWhenHidden?: boolean;
};

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const;

export async function recordPracticeSession(
  userId: string | undefined,
  kind: PracticeSessionKind,
  startedAtMs: number,
  endedAtMs = Date.now(),
): Promise<void> {
  if (!userId) return;
  await recordPracticeSessionDuration(userId, kind, endedAtMs - startedAtMs);
}

/** Persist a session from accumulated engaged milliseconds (maps to startedAt/endedAt for the API). */
export async function recordPracticeSessionDuration(
  userId: string | undefined,
  kind: PracticeSessionKind,
  durationMs: number,
): Promise<void> {
  if (!userId || durationMs < MIN_PRACTICE_SESSION_MS) return;

  const endedAtMs = Date.now();
  const startedAtMs = endedAtMs - durationMs;
  const startedAt = new Date(startedAtMs).toISOString();
  const endedAt = new Date(endedAtMs).toISOString();

  try {
    await usePracticeStore.getState().recordSession({ kind, startedAt, endedAt });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(PRACTICE_SESSION_LOGGED_EVENT));
    }
  } catch (error) {
    console.warn('[practice-session] failed to record', error);
  }
}

/**
 * Tracks practice time while `active` is true.
 * Default: engaged time only — pauses after idle timeout or when the tab is hidden.
 */
export function usePracticeSessionTracker(
  userId: string | undefined,
  kind: PracticeSessionKind,
  active: boolean,
  options?: PracticeSessionTrackerOptions,
): void {
  const idleTimeoutMs = options?.idleTimeoutMs ?? DEFAULT_PRACTICE_IDLE_TIMEOUT_MS;
  const pauseWhenHidden = options?.pauseWhenHidden ?? idleTimeoutMs !== false;
  const wallClockStartedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (idleTimeoutMs === false) {
      if (!active) {
        if (wallClockStartedRef.current !== null) {
          void recordPracticeSession(userId, kind, wallClockStartedRef.current);
          wallClockStartedRef.current = null;
        }
        return;
      }

      wallClockStartedRef.current = Date.now();

      return () => {
        if (wallClockStartedRef.current !== null) {
          void recordPracticeSession(userId, kind, wallClockStartedRef.current);
          wallClockStartedRef.current = null;
        }
      };
    }

    if (!active) return;

    let engagedMs = 0;
    let engagedSpanStart: number | null = Date.now();
    let isPaused = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearIdleTimer = () => {
      if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
      }
    };

    const flushEngagedSpan = () => {
      if (engagedSpanStart === null) return;
      engagedMs += Date.now() - engagedSpanStart;
      engagedSpanStart = null;
    };

    const pauseEngaged = () => {
      flushEngagedSpan();
      isPaused = true;
      clearIdleTimer();
    };

    const scheduleIdleCheck = () => {
      clearIdleTimer();
      idleTimer = setTimeout(() => {
        pauseEngaged();
      }, idleTimeoutMs);
    };

    const resumeEngaged = () => {
      if (document.visibilityState === 'hidden' && pauseWhenHidden) return;
      isPaused = false;
      engagedSpanStart = Date.now();
      scheduleIdleCheck();
    };

    const onActivity = () => {
      if (document.visibilityState === 'hidden' && pauseWhenHidden) return;
      if (isPaused) resumeEngaged();
      else scheduleIdleCheck();
    };

    const onVisibilityChange = () => {
      if (!pauseWhenHidden) return;
      if (document.visibilityState === 'hidden') pauseEngaged();
    };

    scheduleIdleCheck();

    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, onActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, onActivity);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearIdleTimer();
      flushEngagedSpan();
      void recordPracticeSessionDuration(userId, kind, engagedMs);
    };
  }, [active, userId, kind, idleTimeoutMs, pauseWhenHidden]);
}
