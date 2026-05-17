'use client';

import { useEffect, useRef } from 'react';
import type { RecordPracticeSessionRequestDto } from '@soenglish/shared-types';
import { usePracticeStore } from '../stores/practice-store';

export const PRACTICE_SESSION_LOGGED_EVENT = 'practice-session-logged';

/** Ignore very short visits (mis-clicks, instant back). */
const MIN_SESSION_MS = 30_000;

export type PracticeSessionKind = RecordPracticeSessionRequestDto['kind'];

export async function recordPracticeSession(
  userId: string | undefined,
  kind: PracticeSessionKind,
  startedAtMs: number,
  endedAtMs = Date.now(),
): Promise<void> {
  if (!userId || endedAtMs - startedAtMs < MIN_SESSION_MS) return;

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
 * Tracks wall-clock time while `active` is true and persists via GraphQL.
 */
export function usePracticeSessionTracker(
  userId: string | undefined,
  kind: PracticeSessionKind,
  active: boolean,
): void {
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    if (!active) {
      if (startedAtRef.current !== null) {
        void recordPracticeSession(userId, kind, startedAtRef.current);
        startedAtRef.current = null;
      }
      return;
    }

    startedAtRef.current = Date.now();

    return () => {
      if (startedAtRef.current !== null) {
        void recordPracticeSession(userId, kind, startedAtRef.current);
        startedAtRef.current = null;
      }
    };
  }, [active, userId, kind]);
}
