'use client';

import type { MutableRefObject } from 'react';
import { Repeat } from 'lucide-react';
import type { ScheduledLessonDto } from '@pkg/types';
import { readLessonDragPayload, writeLessonDragPayload } from '../../features/calendar/dnd/dragPayload';
import { lessonStartTimeInZone } from '../../lib/lessonTime';
import { useCampusT } from '../../lib/cms';
import { type StudentColor } from './calendarUtils';
import styles from './page.module.scss';

const WEEKDAY_KEYS = [
  'lessonModal.day.mon',
  'lessonModal.day.tue',
  'lessonModal.day.wed',
  'lessonModal.day.thu',
  'lessonModal.day.fri',
  'lessonModal.day.sat',
  'lessonModal.day.sun',
] as const;

interface CalendarMonthViewProps {
  year: number;
  month: number;
  daysCount: number;
  firstDow: number;
  today: string;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  canManage: boolean;
  focusedLessonId: number | null;
  draggingLessonId: number | null;
  setDraggingLessonId: (id: number | null) => void;
  monthGhostDate: string | null;
  setMonthGhostDate: (date: string | null) => void;
  resizedRef: MutableRefObject<boolean>;
  lessonsOnDate: (date: string) => ScheduledLessonDto[];
  getLessonColor: (lesson: ScheduledLessonDto) => StudentColor;
  colorHexFromStudentId: (id: number) => string | null;
  lessonColorStyles: (lesson: ScheduledLessonDto) => React.CSSProperties;
  openCreateModal: (date: string) => void;
  openEditModal: (lesson: ScheduledLessonDto) => void;
  moveLesson: (id: number, date: string, startTime?: string) => void;
  viewerIana: string;
}

export function CalendarMonthView({
  year, month, daysCount, firstDow, today, selectedDate, setSelectedDate,
  canManage, focusedLessonId, draggingLessonId, setDraggingLessonId,
  monthGhostDate, setMonthGhostDate, resizedRef,
  lessonsOnDate, getLessonColor, colorHexFromStudentId, lessonColorStyles,
  openCreateModal, openEditModal, moveLesson, viewerIana,
}: CalendarMonthViewProps) {
  const t = useCampusT();
  return (
    <div className={styles.monthGrid}>
      {WEEKDAY_KEYS.map((key) => (
        <div key={key} className={styles.dayName}>{t(key)}</div>
      ))}
      {Array.from({ length: firstDow }).map((_, i) => (
        <div key={`e${i}`} className={styles.emptyCell} />
      ))}
      {Array.from({ length: daysCount }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLessons = lessonsOnDate(dateStr).sort(
          (a, b) =>
            lessonStartTimeInZone(a, viewerIana).localeCompare(
              lessonStartTimeInZone(b, viewerIana),
            ) || a.order - b.order,
        );
        const isSelected = selectedDate === dateStr;
        const isToday = dateStr === today;
        const isPastDay = dateStr < today;
        return (
          <div
            key={day}
            className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ''} ${isToday ? styles.dayCellToday : ''} ${isPastDay ? styles.dayCellPast : ''}`}
            onClick={() => setSelectedDate(dateStr)}
            onDoubleClick={() => { if (!canManage) return; openCreateModal(dateStr); }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!draggingLessonId) return;
              setMonthGhostDate(dateStr);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const payload = readLessonDragPayload(e.dataTransfer);
              const lessonId = payload?.lessonId ?? draggingLessonId;
              if (!lessonId) return;
              moveLesson(lessonId, dateStr);
              setMonthGhostDate(null);
              setDraggingLessonId(null);
            }}
          >
            <span className={styles.dayNum}>{day}</span>
            <div className={styles.dayDots}>
              {dayLessons.slice(0, 3).map((lesson) => (
                <div
                  key={lesson.id}
                  className={`${styles.dayDot} ${styles[`dot${getLessonColor(lesson)}`]}`}
                  style={colorHexFromStudentId(lesson.studentId) ? { backgroundColor: colorHexFromStudentId(lesson.studentId)! } : undefined}
                />
              ))}
            </div>
            <div className={styles.dayLessons}>
              {dayLessons.slice(0, 3).map((lesson) => {
                const canDragLesson = canManage && lesson.startTime > String(Date.now());
                return (
                  <div
                    key={lesson.id}
                    data-month-lesson-id={lesson.id}
                    className={`${styles.dayLessonItem} ${styles[`evt${getLessonColor(lesson)}`]} ${!canManage ? styles.dragDisabled : ''} ${focusedLessonId === lesson.id ? styles.lessonFocusPulse : ''}`}
                    style={lessonColorStyles(lesson)}
                    draggable={canManage}
                    onDragStart={(e) => {
                      if (!canManage) { e.preventDefault(); return; }
                      writeLessonDragPayload(e.dataTransfer, { lessonId: lesson.id });
                      setDraggingLessonId(lesson.id);
                    }}
                    onDragEnd={() => {
                      setMonthGhostDate(null);
                      setDraggingLessonId(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (resizedRef.current) return;
                      openEditModal(lesson);
                    }}
                  >
                    <div className={styles.dayLessonTitle}>
                      {lesson.seriesId ? (
                        <Repeat size={11} className={styles.seriesBadge} aria-hidden />
                      ) : null}
                      {lessonStartTimeInZone(lesson, viewerIana)} {lesson.title}
                    </div>
                  </div>
                );
              })}
              {dayLessons.length > 3 ? (
                <div className={styles.dayMore}>+{dayLessons.length - 3} more</div>
              ) : null}
              {monthGhostDate === dateStr ? (
                <div className={styles.dayGhostEvent}>Drop lesson here</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
