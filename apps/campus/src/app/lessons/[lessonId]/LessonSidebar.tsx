'use client';

import Link from 'next/link';
import { BookOpen, Calendar, Clock3, Save, UserRound } from 'lucide-react';
import { Button, Field, SurfaceCard } from '../../../components/ui';
import { StudentSelectField } from '../../../components/students';
import { LESSON_STATUS } from '@pkg/types';
import { USER_ROLE } from '@pkg/types';
import type { ScheduledLessonDto } from '@pkg/types';
import { LessonVideoButton } from '../../../components/backend/LessonMeetButton';
import { LessonVideoEmbed } from '../../../components/backend/LessonVideoEmbed';
import { LessonPartyScheduleTimes } from '../../../components/lessons/LessonPartyScheduleTimes';
import { getLessonBackendId } from '../../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { resolvePartyBackendId } from '../../../features/lesson-modal/lessonPersistence';
import { formatLessonStudentLabel, isGroupLesson } from '../../../lib/lesson-display';
import type { LessonPartyOption } from '../../../hooks/use-lesson-party-options';
import type { UserRoleId } from '@pkg/types';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
import { formatLongDate } from './lesson-page-utils';
import styles from './page.module.scss';

interface LessonSidebarProps {
  draft: ScheduledLessonDto;
  lesson: ScheduledLessonDto;
  canManageLessons: boolean;
  canReassignTeacher: boolean;
  canStudentSubmitHomework: boolean;
  statusLabel: string;
  teacherDisplayName: string;
  studentDisplayName: string;
  showSummaryBlock: boolean;
  calendarHref: string;
  role: UserRoleId;
  teacherOptions: LessonPartyOption[];
  studentOptions: LessonPartyOption[];
  timezoneIanaByPartyId: Map<number, string | undefined>;
  onUpdate: (next: ScheduledLessonDto) => void;
  onStatusBadgeClick: () => void;
  onPersistLesson: () => void;
}

export function LessonSidebar({
  draft,
  lesson,
  canManageLessons,
  canReassignTeacher,
  canStudentSubmitHomework,
  statusLabel,
  teacherDisplayName,
  studentDisplayName,
  showSummaryBlock,
  calendarHref,
  role,
  teacherOptions,
  studentOptions,
  timezoneIanaByPartyId,
  onUpdate,
  onStatusBadgeClick,
  onPersistLesson,
}: LessonSidebarProps) {
  const t = useCampusT();
  const { locale } = useCampusI18n();

  return (
    <SurfaceCard className={styles.sidebarCard} padding="none">
      <div className={styles.sidebarInner}>
        <section className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span className={styles.sidebarSectionEyebrow}>{t('lessonDetail.identity')}</span>
          </div>
          <div className={styles.heroBlock}>
            <div className={styles.heroIcon}>
              <BookOpen size={22} strokeWidth={2} aria-hidden />
            </div>
            <div className={styles.heroMain}>
              <span className={styles.heroContextBadge}>{t('lessonDetail.room')}</span>
              {canManageLessons ? (
                <div className={styles.heroTitleWrap}>
                  <span className={styles.metaLabel}>{t('lessonDetail.titleLabel')}</span>
                  <Field
                    as="input"
                    className={styles.heroTitleInput}
                    value={draft.title}
                    onChange={(e) => onUpdate({ ...draft, title: e.target.value })}
                  />
                </div>
              ) : null}
              <div className={styles.heroBadges}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onStatusBadgeClick}
                  disabled={!canManageLessons}
                  className={`${styles.statusBadge} ${draft.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${draft.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${draft.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
                  aria-label={
                    canManageLessons
                      ? t('lessonDetail.statusAriaChange', { status: statusLabel })
                      : t('lessonDetail.statusAria', { status: statusLabel })
                  }
                >
                  {statusLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span className={styles.sidebarSectionEyebrow}>{t('lessonDetail.schedulePeople')}</span>
          </div>
          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="calendar"><Calendar size={16} aria-hidden /></span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>{t('lessonModal.field.date')}</span>
                <Field type="date" className={!canManageLessons ? styles.metaValue : undefined}
                  value={draft.date} readOnly={!canManageLessons}
                  formatValue={(value) => typeof value === 'string' && value ? formatLongDate(value, locale) : '—'}
                  onChange={(e) => onUpdate({ ...draft, date: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="clock"><Clock3 size={16} aria-hidden /></span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>{t('lessonDetail.time')}</span>
                <div className={styles.inlineRow}>
                  <Field type="time" className={!canManageLessons ? styles.metaValue : undefined}
                    value={draft.startTime} readOnly={!canManageLessons}
                    onChange={(e) => onUpdate({ ...draft, startTime: e.target.value })}
                  />
                  <Field type="number" min={15} step={5} className={!canManageLessons ? styles.metaValue : undefined}
                    value={draft.duration} readOnly={!canManageLessons}
                    formatValue={(value) => t('lessons.durationMin', { duration: Number(value) || 0 })}
                    onChange={(e) => onUpdate({ ...draft, duration: Math.max(15, Number(e.target.value) || 15) })}
                  />
                </div>
                <LessonPartyScheduleTimes
                  wall={{ date: draft.date, startTime: draft.startTime, duration: draft.duration, timezoneId: draft.timezoneId }}
                  role={role}
                  teacherTimezoneIana={timezoneIanaByPartyId.get(draft.teacherId)}
                  studentTimezoneIana={timezoneIanaByPartyId.get(draft.studentId)}
                  teacherName={teacherDisplayName}
                  studentName={studentDisplayName}
                />
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="teacher"><UserRound size={16} aria-hidden /></span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>{t('lessonDetail.schedule.teacher')}</span>
                {canReassignTeacher ? (
                  <div className={styles.metaSelectHost}>
                    <Field as="select" className={styles.metaSelect} value={String(draft.teacherId)}
                      onChange={(e) => {
                        const next = teacherOptions.find((opt) => opt.id === Number(e.target.value));
                        if (!next) return;
                        onUpdate({ ...draft, teacherId: next.id, teacherName: next.fullName });
                      }}
                    >
                      {teacherOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.fullName}</option>)}
                    </Field>
                  </div>
                ) : (
                  <Field as="input" className={styles.metaValue} value={teacherDisplayName} readOnly />
                )}
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="student"><UserRound size={16} aria-hidden /></span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>
                  {isGroupLesson(draft) ? t('lessonModal.field.students') : t('lessonModal.field.student')}
                </span>
                {isGroupLesson(draft) ? (
                  <div className={styles.participantsList}>
                    <p className={styles.metaValue}>{formatLessonStudentLabel(draft)}</p>
                    <ul className={styles.participantsLinks}>
                      {(draft.participants ?? []).map((participant) => {
                        const backendId = resolvePartyBackendId(participant.userId, studentOptions, teacherOptions);
                        if (!backendId) return <li key={participant.userId}>{participant.displayName}</li>;
                        return (
                          <li key={participant.userId}>
                            <Link href={`/students/${backendId}`}>
                              {participant.displayName || t('lessonModal.field.student')}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : canManageLessons ? (
                  <div className={styles.metaSelectHost}>
                    <StudentSelectField className={styles.metaSelect} value={String(draft.studentId)}
                      valueKind="partyId" fallbackLabel={studentDisplayName}
                      onValueChange={(nextValue, student) => {
                        if (!student) return;
                        onUpdate({ ...draft, studentId: Number(nextValue), studentName: student.displayName });
                      }}
                    />
                  </div>
                ) : (
                  <Field as="input" className={styles.metaValue} value={studentDisplayName} readOnly />
                )}
              </div>
            </div>
            {canManageLessons && draft.statusId === LESSON_STATUS.cancelled.id ? (
              <>
                <div className={styles.metaRow}>
                  <span className={styles.metaIcon} data-accent="clock"><Clock3 size={16} aria-hidden /></span>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>{t('lessonModal.field.cancelReason')}</span>
                    <div className={styles.metaSelectHost}>
                      <Field as="select" className={styles.metaSelect}
                        value={draft.cancelReason ?? 'student_absent'}
                        onChange={(e) => onUpdate({ ...draft, cancelReason: e.target.value as NonNullable<typeof draft.cancelReason> })}
                      >
                        <option value="student_absent">{t('lessonModal.opt.studentAbsent')}</option>
                        <option value="student_requested_cancel">{t('lessonModal.opt.studentRequestedCancel')}</option>
                        <option value="teacher_absent">{t('lessonModal.opt.teacherAbsent')}</option>
                      </Field>
                    </div>
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaIcon} data-accent="teacher"><UserRound size={16} aria-hidden /></span>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>{t('lessonModal.field.credited')}</span>
                    <div className={styles.metaSelectHost}>
                      <Field as="select" className={styles.metaSelect}
                        value={draft.credited ? 'yes' : 'no'}
                        onChange={(e) => onUpdate({ ...draft, credited: e.target.value === 'yes' })}
                      >
                        <option value="yes">{t('lessonDetail.yes')}</option>
                        <option value="no">{t('lessonDetail.no')}</option>
                      </Field>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <section className={styles.sidebarSection}>
          <div className={styles.sidebarSectionHead}>
            <span className={styles.sidebarSectionEyebrow}>{t('lessonDetail.actions')}</span>
          </div>
          <div className={styles.sidebarActions} data-tour-anchor="lesson-join-video">
            {lesson.videoProvider === 'livekit' && getLessonBackendId(lesson) ? (
              <LessonVideoEmbed lessonBackendId={getLessonBackendId(lesson)!} />
            ) : (
              <LessonVideoButton
                lessonBackendId={getLessonBackendId(lesson) ?? null}
                meetUrl={lesson.videoMeetingUrl ?? lesson.googleMeetUrl ?? null}
                provider={lesson.videoProvider ?? null}
                fallbackClassName={styles.meetButton}
              />
            )}
            <Button href={calendarHref} variant="ghost" className={styles.calendarButton}
              startIcon={<Calendar size={17} aria-hidden />}
            >
              {t('lessonDetail.openCalendar')}
            </Button>
            {canManageLessons || canStudentSubmitHomework ? (
              <Button type="button" variant="primary" className={styles.editLessonBtn}
                onClick={onPersistLesson}
                startIcon={<Save size={16} aria-hidden />}
                loadingLabel={canManageLessons ? t('lessonDetail.saving') : t('lessonDetail.submitting')}
                loadingAriaLabel={canManageLessons ? t('lessonDetail.savingAria') : t('lessonDetail.submittingAria')}
              >
                {canManageLessons ? t('lessonModal.action.saveLesson') : t('lessonDetail.submitHomework')}
              </Button>
            ) : null}
          </div>
        </section>

        {showSummaryBlock ? (
          <section className={styles.sidebarSection}>
            <div className={styles.sidebarSectionHead}>
              <span className={styles.sidebarSectionEyebrow}>{t('lessonDetail.brief')}</span>
            </div>
            <div className={styles.descriptionWrap}>
              <Field as="textarea" rows={4}
                className={!canManageLessons ? styles.description : undefined}
                value={draft.description ?? ''}
                readOnly={!canManageLessons}
                placeholder={t('lessonDetail.briefPlaceholder')}
                onChange={(e) => onUpdate({ ...draft, description: e.target.value })}
              />
            </div>
          </section>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
