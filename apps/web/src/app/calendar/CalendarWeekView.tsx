'use client';

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { Repeat } from 'lucide-react';
import type { ScheduledLessonDto } from '@pkg/types';
import { readLessonDragPayload, writeLessonDragPayload } from '../../features/calendar/dnd/dragPayload';
import {
  lessonDateKeyInZone,
  lessonEndTimeInZone,
  lessonStartTimeInZone,
  viewerSlotToLessonWall,
} from '../../lib/lessonTime';
import {
  buildWeekEventLayout,
  DAY_COLUMN_HEIGHT,
  DAYS,
  HOUR_MARKS,
  MINUTES_PER_DAY,
  PX_PER_MINUTE,
  START_HOUR,
  toDateString,
  toMinutes,
  type ResizeState,
  type StudentColor,
} from './calendarUtils';
import styles from './page.module.scss';

interface CalendarWeekViewProps {
  weekDays: Date[];
  today: string;
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  weekLessons: ScheduledLessonDto[];
  lessons: ScheduledLessonDto[];
  weekGhost: { lessonId: number; date: string; startTime: string; duration: number; title: string } | null;
  setWeekGhost: Dispatch<SetStateAction<{ lessonId: number; date: string; startTime: string; duration: number; title: string } | null>>;
  draggingLessonId: number | null;
  setDraggingLessonId: (id: number | null) => void;
  weekIncludesToday: boolean;
  weekNowTopPx: number;
  nowTimeLabel: string;
  canManage: boolean;
  focusedLessonId: number | null;
  resizeState: ResizeState | null;
  setResizeState: Dispatch<SetStateAction<ResizeState | null>>;
  resizedRef: MutableRefObject<boolean>;
  suppressDragRef: MutableRefObject<boolean>;
  setMonthGhostDate: (date: string | null) => void;
  getLessonColor: (lesson: ScheduledLessonDto) => StudentColor;
  colorFromStudentId: (id: number) => StudentColor;
  lessonColorStyles: (lesson: ScheduledLessonDto) => React.CSSProperties;
  openCreateModal: (date: string) => void;
  openEditModal: (lesson: ScheduledLessonDto) => void;
  moveLesson: (id: number, date: string, startTime?: string) => void;
  viewerIana: string;
}

export function CalendarWeekView({
  weekDays, today, selectedDate, setSelectedDate, weekLessons, lessons,
  weekGhost, setWeekGhost, draggingLessonId, setDraggingLessonId,
  weekIncludesToday, weekNowTopPx, nowTimeLabel, canManage, focusedLessonId,
  resizeState, setResizeState, resizedRef, suppressDragRef, setMonthGhostDate,
  getLessonColor, colorFromStudentId, lessonColorStyles,
  openCreateModal, openEditModal, moveLesson, viewerIana,
}: CalendarWeekViewProps) {
  return (
    <div className={styles.weekView}>
      <div className={styles.weekHeader}>
        <div className={styles.weekTimeCol} />
        {weekDays.map((date) => {
          const dateStr = toDateString(date);
          const isToday = dateStr === today;
          const isSelected = selectedDate === dateStr;
          const isPastDay = dateStr < today;
          return (
            <div
              key={dateStr}
              className={`${styles.weekDayHeader} ${isToday ? styles.weekDayToday : ''} ${isSelected ? styles.weekDaySelected : ''} ${isPastDay ? styles.weekDayPast : ''}`}
              onClick={() => setSelectedDate(dateStr)}
            >
              <div className={styles.weekDayName}>{DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
              <div className={styles.weekDayNum}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.weekBody}>
        <div className={styles.weekRow} style={{ minHeight: DAY_COLUMN_HEIGHT }}>
          {weekIncludesToday && weekNowTopPx >= 0 && weekNowTopPx <= DAY_COLUMN_HEIGHT ? (
            <div className={styles.weekNowLine} style={{ top: weekNowTopPx }} aria-hidden>
              <span className={styles.weekNowLabel}>{nowTimeLabel}</span>
            </div>
          ) : null}
          <div className={styles.weekHour}>
            {HOUR_MARKS.map((hour) => (
              <div key={hour} style={{ height: 72 }}>{hour}:00</div>
            ))}
          </div>
          {weekDays.map((date) => {
            const dateStr = toDateString(date);
            const dayLessons = weekLessons.filter(
              (lesson) => lessonDateKeyInZone(lesson, viewerIana) === dateStr,
            );
            const isPastDay = dateStr < today;
            const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
            const passedMinutesToday = isPastDay
              ? MINUTES_PER_DAY
              : dateStr === today
                ? Math.max(0, Math.min(MINUTES_PER_DAY, nowMinutes - START_HOUR * 60))
                : 0;
            return (
              <div
                key={dateStr}
                className={`${styles.weekCell} ${isPastDay ? styles.weekCellPast : ''}`}
                style={{ position: 'relative', minHeight: DAY_COLUMN_HEIGHT }}
                onDoubleClick={() => { if (!canManage) return; openCreateModal(dateStr); }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!draggingLessonId) return;
                  const source = lessons.find((lesson) => lesson.id === draggingLessonId);
                  if (!source) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const minutes = Math.max(
                    0,
                    Math.min(MINUTES_PER_DAY - 55, Math.round((e.clientY - rect.top) / PX_PER_MINUTE / 15) * 15),
                  );
                  const hh = START_HOUR + Math.floor(minutes / 60);
                  const mm = minutes % 60;
                  setWeekGhost({
                    lessonId: draggingLessonId,
                    date: dateStr,
                    startTime: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
                    duration: source.duration,
                    title: source.title,
                  });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const payload = readLessonDragPayload(e.dataTransfer);
                  const lessonId = payload?.lessonId ?? draggingLessonId;
                  if (!lessonId) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const minutes = Math.max(
                    0,
                    Math.min(MINUTES_PER_DAY - 55, Math.round((e.clientY - rect.top) / PX_PER_MINUTE / 15) * 15),
                  );
                  const hh = START_HOUR + Math.floor(minutes / 60);
                  const mm = minutes % 60;
                  moveLesson(lessonId, dateStr, `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
                  setWeekGhost(null);
                  setDraggingLessonId(null);
                }}
              >
                {passedMinutesToday > 0 ? (
                  <div
                    className={styles.weekPastOverlay}
                    style={{ height: passedMinutesToday * PX_PER_MINUTE }}
                  />
                ) : null}
                {(() => {
                  const sortedDay = [...dayLessons].sort(
                    (a, b) =>
                      lessonStartTimeInZone(a, viewerIana).localeCompare(
                        lessonStartTimeInZone(b, viewerIana),
                      ) || a.duration - b.duration,
                  );
                  const dayLayout = buildWeekEventLayout(
                    sortedDay.map((l) => ({
                      ...l,
                      startTime: lessonStartTimeInZone(l, viewerIana),
                      endTime: lessonEndTimeInZone(l, viewerIana),
                    })),
                  );
                  return sortedDay.map((lesson) => {
                    const canDragLesson = canManage && lessonStartTimeInZone(lesson, viewerIana) > new Date().toTimeString().slice(0, 5);
                    const canResizeLesson = canManage;
                    const [hh, mm] = lessonStartTimeInZone(lesson, viewerIana).split(':').map(Number);
                    const startMinutes = (hh - START_HOUR) * 60 + mm;
                    const top = startMinutes * PX_PER_MINUTE;
                    const height = Math.max(55 * PX_PER_MINUTE, lesson.duration * PX_PER_MINUTE);
                    const layout = dayLayout[lesson.id] ?? { columnIndex: 0, columnsTotal: 1 };
                    const widthPercent = 100 / layout.columnsTotal;
                    const leftPercent = widthPercent * layout.columnIndex;
                    return (
                      <div
                        key={lesson.id}
                        data-week-lesson-id={lesson.id}
                        className={`${styles.weekEvt} ${styles[`evt${getLessonColor(lesson)}`]} ${!canDragLesson ? styles.dragDisabled : ''} ${focusedLessonId === lesson.id ? styles.lessonFocusPulse : ''}`}
                        style={{
                          position: 'absolute',
                          top,
                          height,
                          left: `calc(${leftPercent}% + 3px)`,
                          width: `calc(${widthPercent}% - 6px)`,
                          ...lessonColorStyles(lesson),
                        }}
                        draggable={canDragLesson}
                        onDragStart={(ev) => {
                          if (!canDragLesson) { ev.preventDefault(); return; }
                          if (suppressDragRef.current || resizeState) { ev.preventDefault(); return; }
                          writeLessonDragPayload(ev.dataTransfer, { lessonId: lesson.id });
                          setDraggingLessonId(lesson.id);
                        }}
                        onDragEnd={() => {
                          setMonthGhostDate(null);
                          setWeekGhost(null);
                          setDraggingLessonId(null);
                        }}
                        onClick={() => {
                          if (resizedRef.current) return;
                          openEditModal(lesson);
                        }}
                      >
                        <div
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, cursor: canResizeLesson ? 'ns-resize' : 'default' }}
                          onMouseDown={(ev) => {
                            if (!canResizeLesson) return;
                            ev.stopPropagation();
                            suppressDragRef.current = true;
                            setResizeState({
                              lessonId: lesson.id,
                              edge: 'top',
                              originY: ev.clientY,
                              snapshot: { ...lesson },
                              initialDuration: lesson.duration,
                              viewerDate: lessonDateKeyInZone(lesson, viewerIana),
                              initialViewerStartMinutes: toMinutes(lessonStartTimeInZone(lesson, viewerIana)),
                            });
                          }}
                        />
                        {/* TIME → Subject → Teacher hierarchy (V4-01) */}
                        <div className={styles.weekEvtTime}>
                          {lessonStartTimeInZone(lesson, viewerIana)}
                        </div>
                        <div className={styles.weekEvtTitle}>
                          {lesson.seriesId ? (
                            <Repeat size={12} className={styles.seriesBadge} aria-hidden />
                          ) : null}
                          <span>{lesson.title}</span>
                        </div>
                        <div className={styles.weekEvtTeacher}>{lesson.teacherName}</div>
                        <div
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, cursor: canResizeLesson ? 'ns-resize' : 'default' }}
                          onMouseDown={(ev) => {
                            if (!canResizeLesson) return;
                            ev.stopPropagation();
                            suppressDragRef.current = true;
                            setResizeState({
                              lessonId: lesson.id,
                              edge: 'bottom',
                              originY: ev.clientY,
                              snapshot: { ...lesson },
                              initialDuration: lesson.duration,
                              viewerDate: '',
                              initialViewerStartMinutes: 0,
                            });
                          }}
                        />
                      </div>
                    );
                  });
                })()}
                {weekGhost && weekGhost.date === dateStr ? (() => {
                  const [ghostH, ghostM] = weekGhost.startTime.split(':').map(Number);
                  const ghostStartMinutes = (ghostH - START_HOUR) * 60 + ghostM;
                  const ghostTop = ghostStartMinutes * PX_PER_MINUTE;
                  const ghostHeight = Math.max(55 * PX_PER_MINUTE, weekGhost.duration * PX_PER_MINUTE);
                  const ghostLesson = lessons.find((l) => l.id === weekGhost.lessonId);
                  return (
                    <div
                      className={`${styles.weekGhostEvent} ${styles[`evt${colorFromStudentId(ghostLesson?.studentId ?? 0)}`]} ${draggingLessonId ? styles.weekGhostEventDragging : ''}`}
                      style={{
                        top: ghostTop,
                        height: ghostHeight,
                        ...(ghostLesson ? lessonColorStyles(ghostLesson) : {}),
                      }}
                    >
                      <div className={styles.weekEvtTime}>{weekGhost.startTime}</div>
                      <div className={styles.weekEvtTitle}>{weekGhost.title}</div>
                    </div>
                  );
                })() : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
