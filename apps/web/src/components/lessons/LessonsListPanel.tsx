'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { getLessonRouteId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { BookOpen, Calendar, ChevronRight, Clock, Pencil, Search, Users, Video } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../ui';
import styles from './LessonsListPanel.module.scss';

const STATUS_OPTIONS: Array<{ value: 'all' | ScheduledLessonDto['statusId']; label: string }> = [
  { value: LESSON_STATUS.planned.id, label: 'Planned' },
  { value: LESSON_STATUS.completed.id, label: 'Done' },
  { value: LESSON_STATUS.cancelled.id, label: 'Cancelled' },
  { value: 'all', label: 'All' },
];

function statusLabel(statusId: ScheduledLessonDto['statusId']) {
  if (statusId === LESSON_STATUS.planned.id) return 'Planned';
  if (statusId === LESSON_STATUS.completed.id) return 'Completed';
  return 'Cancelled';
}

function formatShortDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function LessonsListPanel({
  lessons,
  canManageLessons = false,
  onEditLesson,
  emptyText = 'No lessons match your filters.',
  defaultStatusFilter = LESSON_STATUS.planned.id,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  listLoading = false,
}: {
  lessons: ScheduledLessonDto[];
  canManageLessons?: boolean;
  onEditLesson?: (lesson: ScheduledLessonDto) => void;
  emptyText?: string;
  defaultStatusFilter?: 'all' | ScheduledLessonDto['statusId'];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  listLoading?: boolean;
}) {
  const router = useRouter();
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ScheduledLessonDto['statusId']>(
    defaultStatusFilter,
  );

  const filteredLessons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      const queryMatch =
        normalizedQuery.length === 0 ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        lesson.teacherName.toLowerCase().includes(normalizedQuery) ||
        lesson.studentName.toLowerCase().includes(normalizedQuery);
      const statusMatch = statusFilter === 'all' || lesson.statusId === statusFilter;
      return queryMatch && statusMatch;
    });
  }, [lessons, query, statusFilter]);

  const handleLoadMore = useCallback(() => {
    if (!onLoadMore || loadingMore || !hasMore || listLoading) return;
    onLoadMore();
  }, [hasMore, listLoading, loadingMore, onLoadMore]);

  useEffect(() => {
    if (!onLoadMore) return;
    const root = listScrollRef.current;
    const sentinel = loadMoreSentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { root, rootMargin: '120px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, onLoadMore, filteredLessons.length, hasMore]);

  return (
    <SurfaceCard className={styles.listPane}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} aria-hidden />
          <Field
            type="search"
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, teacher, or student..."
            aria-label="Search lessons"
          />
        </div>
        <div className={styles.filterBlock}>
          <span className={styles.filterHeading}>Status</span>
          <div className={styles.chipRow} role="group" aria-label="Filter by status">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="ghost"
                className={`${styles.chip} ${statusFilter === opt.value ? styles.chipActive : ''}`}
                onClick={() => setStatusFilter(opt.value)}
                aria-pressed={statusFilter === opt.value}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.toolbarMeta}>
          <span className={styles.countMuted}>
            {onLoadMore
              ? `Showing ${filteredLessons.length} loaded${hasMore ? ' · scroll for more' : ''}`
              : `Showing ${filteredLessons.length} of ${lessons.length}`}
          </span>
        </div>
      </div>

      <div ref={listScrollRef} className={styles.listScroll}>
      <div className={styles.list}>
        {listLoading ? <div className={styles.empty}>Loading lessons…</div> : null}
        {!listLoading
          ? filteredLessons.map((lesson) => {
          const routeId = getLessonRouteId(lesson);
          return (
          <div
            key={lesson.backendId ?? `local-${lesson.id}`}
            className={styles.lessonCard}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/lessons/${routeId}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(`/lessons/${routeId}`);
              }
            }}
          >
            <div className={styles.lessonCardInner}>
              <div className={styles.lessonIconWrap}>
                <span className={styles.lessonIconBadge}>
                  <BookOpen size={18} strokeWidth={2} />
                </span>
              </div>
              <div className={styles.lessonMain}>
                <div className={styles.lessonTitleRow}>
                  <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                </div>
                <div className={styles.lessonMetaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={14} aria-hidden />
                    {formatShortDate(lesson.date)}
                  </span>
                  <span className={styles.metaItem}>
                    <Clock size={14} aria-hidden />
                    {lesson.startTime}–{lesson.endTime} · {lesson.duration} min
                  </span>
                  <span className={styles.metaItem}>
                    <Users size={14} aria-hidden />
                    {lesson.teacherName}
                    <span className={styles.metaSep}>·</span>
                    {lesson.studentName}
                  </span>
                </div>
              </div>
              <span
                className={`${styles.statusPill} ${styles.statusPillAside} ${lesson.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${lesson.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${lesson.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
              >
                {statusLabel(lesson.statusId)}
              </span>
              <div className={styles.lessonAside}>
                <span className={styles.quickActions} aria-hidden>
                  <ChevronRight size={20} className={styles.chevron} />
                </span>
                <Link
                  href={`/lessons/${routeId}`}
                  className={styles.iconActionBtn}
                  aria-label="Open lesson"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Video size={15} />
                </Link>
                {canManageLessons && onEditLesson ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.iconActionBtn}
                    aria-label="Edit lesson"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditLesson(lesson);
                    }}
                  >
                    <Pencil size={15} />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          );
        })
          : null}
        {!listLoading && filteredLessons.length === 0 ? (
          <div className={styles.empty}>{emptyText}</div>
        ) : null}
        {onLoadMore && hasMore ? (
          <div ref={loadMoreSentinelRef} className={styles.loadMoreSentinel} aria-hidden />
        ) : null}
        {loadingMore ? <p className={styles.loadMoreStatus}>Loading more lessons…</p> : null}
        {onLoadMore && !hasMore && lessons.length > 0 && !listLoading ? (
          <p className={styles.loadMoreStatus}>All lessons loaded</p>
        ) : null}
      </div>
      </div>
    </SurfaceCard>
  );
}
