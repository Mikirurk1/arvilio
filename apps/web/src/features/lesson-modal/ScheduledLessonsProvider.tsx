'use client';

import type { ScheduledLessonDto } from '@soenglish/shared-types';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { getInitialLessons } from '../calendar/services/lessonCalendarService';

type ScheduledLessonsContextValue = {
  lessons: ScheduledLessonDto[];
  setLessons: Dispatch<SetStateAction<ScheduledLessonDto[]>>;
};

const ScheduledLessonsContext = createContext<ScheduledLessonsContextValue | null>(null);

export function ScheduledLessonsProvider({ children }: { children: ReactNode }) {
  const [lessons, setLessons] = useState<ScheduledLessonDto[]>(() => getInitialLessons());
  const value = useMemo(() => ({ lessons, setLessons }), [lessons]);
  return <ScheduledLessonsContext.Provider value={value}>{children}</ScheduledLessonsContext.Provider>;
}

export function useScheduledLessons() {
  const ctx = useContext(ScheduledLessonsContext);
  if (!ctx) {
    throw new Error('useScheduledLessons must be used within ScheduledLessonsProvider');
  }
  return ctx;
}
