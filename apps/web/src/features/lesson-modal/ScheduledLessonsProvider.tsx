'use client';

import type { ScheduledLessonDto } from '@soenglish/shared-types';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { getInitialLessons } from '../calendar/services/lessonCalendarService';
import { useLessonsStore } from '../../stores/lessons-store';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { mergeLessonDisplayNames } from './lessonPersistence';
import {
  dedupeScheduledLessons,
  fromBackendLessons,
  hydrateLessonPartyNames,
  scheduledLessonIdentity,
} from './scheduledLessonsBackendAdapter';

type ScheduledLessonsContextValue = {
  lessons: ScheduledLessonDto[];
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
};

const ScheduledLessonsContext = createContext<ScheduledLessonsContextValue | null>(null);

/**
 * Calendar lesson list: local UI state synced from GraphQL via Zustand on mount.
 */
export function ScheduledLessonsProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState<ScheduledLessonDto[]>(() => getInitialLessons());
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const { nameByNumericId } = useLessonPartyOptions();
  const hasReplacedFromBackendRef = useRef(false);

  useEffect(() => {
    void fetchScheduledLessons();
  }, [fetchScheduledLessons]);

  useEffect(() => {
    if (!backendLessons.data) return;
    const fromBackend = fromBackendLessons(backendLessons.data);
    if (!hasReplacedFromBackendRef.current) {
      setLessons(dedupeScheduledLessons(fromBackend));
      hasReplacedFromBackendRef.current = true;
      return;
    }
    setLessons((prev) => {
      const remoteByIdentity = new Map(
        fromBackend.map((row) => [scheduledLessonIdentity(row), row]),
      );
      const knownNumericIds = new Set(prev.map((row) => row.id));
      const merged = prev.map((row) => {
        const remote =
          remoteByIdentity.get(scheduledLessonIdentity(row)) ??
          fromBackend.find(
            (candidate) => candidate.id === row.id && Boolean(candidate.backendId),
          );
        if (!remote) return row;
        return mergeLessonDisplayNames(remote, row);
      });
      const knownIdentities = new Set(prev.map((row) => scheduledLessonIdentity(row)));
      const added = fromBackend.filter((row) => {
        if (knownIdentities.has(scheduledLessonIdentity(row))) return false;
        return !knownNumericIds.has(row.id);
      });
      return dedupeScheduledLessons(added.length > 0 ? [...merged, ...added] : merged);
    });
  }, [backendLessons.data]);

  useEffect(() => {
    if (!hasReplacedFromBackendRef.current || nameByNumericId.size === 0) return;
    setLessons((prev) => hydrateLessonPartyNames(prev, nameByNumericId));
  }, [nameByNumericId]);

  const normalizedLessons = useMemo(() => dedupeScheduledLessons(lessons), [lessons]);
  const value = useMemo(
    () => ({ lessons: normalizedLessons, setLessons }),
    [normalizedLessons],
  );
  return <ScheduledLessonsContext.Provider value={value}>{children}</ScheduledLessonsContext.Provider>;
}

export function useScheduledLessons() {
  const ctx = useContext(ScheduledLessonsContext);
  if (!ctx) {
    throw new Error('useScheduledLessons must be used within ScheduledLessonsProvider');
  }
  return ctx;
}
