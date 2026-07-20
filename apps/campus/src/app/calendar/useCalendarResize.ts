import { useEffect, useRef, useState } from 'react';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { viewerSlotToLessonWall } from '../../lib/lessonTime';
import { calculateEndTime } from '../../features/calendar/adapters/lessonCalendarAdapter';
import { hasTimeConflict, isPastSlot } from '../../features/calendar/rules/conflicts';
import { PX_PER_MINUTE, START_HOUR, type ResizeState } from './calendarUtils';

interface UseCalendarResizeOptions {
  canManage: boolean;
  conflictStrategy: 'same-teacher-overlap' | 'any-overlap';
  viewerIana: string;
  setLessons: React.Dispatch<React.SetStateAction<ScheduledLessonDto[]>>;
  lessonsRef: React.MutableRefObject<ScheduledLessonDto[]>;
  onConflict: (candidate: ScheduledLessonDto, excludeLessonId?: number) => void;
  onPastSlot: () => void;
  onSeriesScheduleConfirm: (type: 'applyAll', before: ScheduledLessonDto, next: ScheduledLessonDto) => void;
  persistScheduleChange: (lessonId: number, before: ScheduledLessonDto, next: ScheduledLessonDto) => void;
  scheduleUnchanged: (before: ScheduledLessonDto, after: ScheduledLessonDto) => boolean;
}

export function useCalendarResize({
  canManage, conflictStrategy, viewerIana, setLessons, lessonsRef,
  onConflict, onPastSlot, onSeriesScheduleConfirm, persistScheduleChange, scheduleUnchanged,
}: UseCalendarResizeOptions) {
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const resizedRef = useRef(false);
  const previewResizeRef = useRef<{ lessonId: number; startTime: string; duration: number } | null>(null);
  const suppressDragRef = useRef(false);

  const handleResizeMove = (event: MouseEvent) => {
    if (!resizeState) return;
    const deltaMinutes = Math.round((event.clientY - resizeState.originY) / (PX_PER_MINUTE * 15)) * 15;
    resizedRef.current = true;
    setLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.id !== resizeState.lessonId) return lesson;
        if (resizeState.edge === 'bottom') {
          const nextDuration = Math.max(55, resizeState.initialDuration + deltaMinutes);
          previewResizeRef.current = { lessonId: lesson.id, startTime: lesson.startTime, duration: nextDuration };
          return { ...lesson, duration: nextDuration, endTime: calculateEndTime(lesson.startTime, nextDuration) };
        }
        const gridStart = START_HOUR * 60;
        const startMinutes = resizeState.initialViewerStartMinutes + deltaMinutes;
        const maxStart = resizeState.initialViewerStartMinutes + resizeState.initialDuration - 55;
        const bounded = Math.max(gridStart, Math.min(startMinutes, maxStart));
        const newDuration = resizeState.initialViewerStartMinutes + resizeState.initialDuration - bounded;
        const newH = Math.floor(bounded / 60);
        const newM = bounded % 60;
        const nextViewerTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
        const wall = viewerSlotToLessonWall(resizeState.viewerDate, nextViewerTime, newDuration, viewerIana, lesson.timezoneId);
        previewResizeRef.current = { lessonId: lesson.id, startTime: wall.startTime, duration: newDuration };
        return { ...lesson, date: wall.date, startTime: wall.startTime, endTime: wall.endTime, duration: newDuration };
      }),
    );
  };

  const stopResize = () => {
    const preview = previewResizeRef.current;
    const snapshot = resizeState?.snapshot ?? null;
    const resizeOutcome: { persist: { lessonId: number; before: ScheduledLessonDto; next: ScheduledLessonDto } | null } = { persist: null };
    if (preview && snapshot) {
      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.id !== preview.lessonId) return lesson;
          const next: ScheduledLessonDto = { ...lesson, statusId: canManage ? lesson.statusId : LESSON_STATUS.planned.id };
          if (hasTimeConflict(prev, next, lesson.id, conflictStrategy)) {
            onConflict(next, lesson.id);
            return snapshot;
          }
          if (isPastSlot(next)) { onPastSlot(); return snapshot; }
          if (!scheduleUnchanged(snapshot, next)) resizeOutcome.persist = { lessonId: lesson.id, before: snapshot, next };
          return next;
        }),
      );
    }
    const resizePersist = resizeOutcome.persist;
    if (resizePersist) {
      const { lessonId, before, next } = resizePersist;
      if (before.seriesId) onSeriesScheduleConfirm('applyAll', before, next);
      else persistScheduleChange(lessonId, before, next);
    }
    setTimeout(() => { resizedRef.current = false; suppressDragRef.current = false; }, 0);
    previewResizeRef.current = null;
    setResizeState(null);
  };

  useEffect(() => {
    if (!resizeState) return undefined;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', stopResize);
    return () => { window.removeEventListener('mousemove', handleResizeMove); window.removeEventListener('mouseup', stopResize); };
  }, [resizeState]);

  return { resizeState, setResizeState, resizedRef, suppressDragRef };
}
