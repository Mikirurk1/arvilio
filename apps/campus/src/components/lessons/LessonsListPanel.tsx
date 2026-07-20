'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ScheduledLessonDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { getLessonRouteId } from '../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { BookOpen, Calendar, ChevronRight, Clock, Pencil, Search, Users, Video } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../ui';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import styles from './LessonsListPanel.module.scss';

type Translate = ReturnType<typeof useCampusT>;

function statusLabel(statusId: ScheduledLessonDto['statusId'], t: Translate) {
  if (statusId === LESSON_STATUS.planned.id) return t('dashboard.lessonStatus.planned');
  if (statusId === LESSON_STATUS.completed.id) return t('dashboard.lessonStatus.completed');
  return t('dashboard.lessonStatus.cancelled');
}

function formatShortDate(isoDate: string, locale: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(locale === 'uk' ? 'uk-UA' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function LessonsListPanel({
  lessons,
  canManageLessons = false,
  onEditLesson,
  emptyText,
  defaultStatusFilter = LESSON_STATUS.planned.id,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  listLoading = false,
  showKindBadge = false,
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
  showKindBadge?: boolean;
}) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ScheduledLessonDto['statusId']>(
    defaultStatusFilter,
  );

  const statusOptions: Array<{ value: 'all' | ScheduledLessonDto['statusId']; label: string }> = [
    { value: LESSON_STATUS.planned.id, label: t('dashboard.lessonStatus.planned') },
    { value: LESSON_STATUS.completed.id, label: t('lessons.list.filterDone') },
    { value: LESSON_STATUS.cancelled.id, label: t('dashboard.lessonStatus.cancelled') },
    { value: 'all', label: t('lessons.list.filterAll') },
  ];

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

  const showingLabel = onLoadMore
    ? hasMore
      ? t('lessons.list.showingLoadedMore', { count: filteredLessons.length })
      : t('lessons.list.showingLoaded', { count: filteredLessons.length })
    : t('lessons.list.showingOf', {
        filtered: filteredLessons.length,
        total: lessons.length,
      });

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
            placeholder={t('lessons.list.searchPlaceholder')}
            aria-label={t('lessons.list.searchAria')}
          />
        </div>
        <div className={styles.filterBlock}>
          <span className={styles.filterHeading}>{t('lessons.list.statusHeading')}</span>
          <div className={styles.chipRow} role="group" aria-label={t('lessons.list.filterAria')}>
            {statusOptions.map((opt) => (
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
          <span className={styles.countMuted}>{showingLabel}</span>
        </div>
      </div>

      <div ref={listScrollRef} className={styles.listScroll}>
      <div className={styles.list}>
        {listLoading ? <div className={styles.empty}>{t('lessons.list.loading')}</div> : null}
        {!listLoading
          ? filteredLessons.map((lesson) => {
          const routeId = getLessonRouteId(lesson);
          return (
          <div key={lesson.backendId ?? `local-${lesson.id}`} className={styles.lessonCard}>
            {/* Stretched link covers whole card; buttons/links inside use isolation: isolate */}
            <Link
              href={`/lessons/${routeId}`}
              className={styles.lessonCardStretchLink}
              aria-label={t('lessons.list.openAria', { title: lesson.title })}
            />
            <div className={styles.lessonCardInner}>
              <div className={styles.lessonIconWrap}>
                <span
                  className={`${styles.lessonIconBadge} ${lesson.statusId === LESSON_STATUS.planned.id ? styles.badgePlanned : ''} ${lesson.statusId === LESSON_STATUS.completed.id ? styles.badgeCompleted : ''} ${lesson.statusId === LESSON_STATUS.cancelled.id ? styles.badgeCancelled : ''}`}
                >
                  <BookOpen size={18} strokeWidth={2} />
                </span>
              </div>
              <div className={styles.lessonMain}>
                <div className={styles.lessonTitleRow}>
                  <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                  {showKindBadge ? (
                    <span
                      className={`${styles.kindPill} ${
                        lesson.kind === 'group' ? styles.kindPillGroup : styles.kindPillIndividual
                      }`}
                    >
                      {lesson.kind === 'group'
                        ? lesson.participantIds && lesson.participantIds.length > 1
                          ? t('lessons.kind.groupCount', { count: lesson.participantIds.length })
                          : t('lessons.kind.group')
                        : t('lessons.kind.individual')}
                    </span>
                  ) : null}
                </div>
                <div className={styles.lessonMetaRow}>
                  <span className={styles.metaItem}>
                    <Calendar size={14} aria-hidden />
                    {formatShortDate(lesson.date, locale)}
                  </span>
                  <span className={styles.metaItem}>
                    <Clock size={14} aria-hidden />
                    {lesson.startTime}–{lesson.endTime} ·{' '}
                    {t('lessons.durationMin', { duration: lesson.duration })}
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
                {statusLabel(lesson.statusId, t)}
              </span>
              <div className={styles.lessonAside}>
                <span className={styles.quickActions} aria-hidden>
                  <ChevronRight size={20} className={styles.chevron} />
                </span>
                <span className={styles.iconActionBtn} aria-hidden>
                  <Video size={15} />
                </span>
                {canManageLessons && onEditLesson ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className={styles.iconActionBtn}
                    aria-label={t('lessons.list.editAria')}
                    onClick={() => onEditLesson(lesson)}
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
          <div className={styles.empty}>{emptyText ?? t('lessons.list.empty')}</div>
        ) : null}
        {onLoadMore && hasMore ? (
          <div ref={loadMoreSentinelRef} className={styles.loadMoreSentinel} aria-hidden />
        ) : null}
        {loadingMore ? <p className={styles.loadMoreStatus}>{t('lessons.list.loadingMore')}</p> : null}
        {onLoadMore && !hasMore && lessons.length > 0 && !listLoading ? (
          <p className={styles.loadMoreStatus}>{t('lessons.list.allLoaded')}</p>
        ) : null}
      </div>
      </div>
    </SurfaceCard>
  );
}
