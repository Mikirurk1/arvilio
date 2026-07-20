'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { USER_ROLE, type UserRoleId } from '@pkg/types';
import { useLessonsStore } from '../../../stores/lessons-store';
import { fromBackendLessons } from '../../lesson-modal/scheduledLessonsBackendAdapter';

export function useLessonCalendarState(activeRole: UserRoleId, activeStudentId: number) {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;
  const [lessons, setLessons] = useState<ScheduledLessonDto[]>([]);
  const [role, setRole] = useState<UserRoleId>(activeRole);
  const [view, setView] = useState<'month' | 'week'>('week');
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso);

  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const replacedFromBackendRef = useRef(false);

  useEffect(() => {
    void fetchScheduledLessons();
  }, [fetchScheduledLessons]);

  useEffect(() => {
    if (!backendLessons.data || replacedFromBackendRef.current) return;
    setLessons(fromBackendLessons(backendLessons.data));
    replacedFromBackendRef.current = true;
  }, [backendLessons.data]);

  useEffect(() => {
    const autoCompletePastLessons = () => {
      const now = Date.now();
      setLessons((prev) => {
        let changed = false;
        const next: ScheduledLessonDto[] = prev.map((lesson) => {
          if (lesson.statusId !== LESSON_STATUS.planned.id) return lesson;
          const lessonEndMs = new Date(`${lesson.date}T${lesson.endTime}:00`).getTime();
          if (Number.isNaN(lessonEndMs) || lessonEndMs > now) return lesson;
          changed = true;
          return {
            ...lesson,
            statusId: LESSON_STATUS.completed.id,
            credited: true,
          };
        });
        return changed ? next : prev;
      });
    };

    autoCompletePastLessons();
    const intervalId = window.setInterval(autoCompletePastLessons, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const visibleLessons = useMemo(
    () => lessons.filter((lesson) => (role === USER_ROLE.student.id ? lesson.studentId === activeStudentId : true)),
    [lessons, role, activeStudentId],
  );

  return {
    lessons,
    setLessons,
    role,
    setRole,
    view,
    setView,
    selectedDate,
    setSelectedDate,
    visibleLessons,
  };
}

