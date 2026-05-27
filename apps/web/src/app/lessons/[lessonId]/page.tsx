'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { LESSON_STATUS } from '@pkg/types';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Clock3,
  File,
  FileText,
  Image,
  Monitor,
  Save,
  UserRound,
} from 'lucide-react';
import { Button, Field, PageHeader, SurfaceCard } from '../../../components/ui';
import {
  canSchedule,
  siteContent,
  USER_ROLE,
} from '../../../mocks';
import { useActiveUser } from '../../../lib/active-user';
import { useOptionalAuth } from '../../../lib/auth-context';
import {
  calculateEndTime,
  fromLessonFormState,
  toLessonFormState,
} from '../../../features/calendar/adapters/lessonCalendarAdapter';
import { useScheduledLessons } from '../../../features/lesson-modal';
import { useLessonPartyOptions } from '../../../hooks/use-lesson-party-options';
import { useScheduledLessonPersistence } from '../../../hooks/use-scheduled-lesson-persistence';
import { resolvePartyBackendId } from '../../../features/lesson-modal/lessonPersistence';
import {
  getLessonBackendId,
  lessonIncludesViewer,
  lessonStringId,
} from '../../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useViewerPartyNumericId } from '../../../hooks/use-viewer-party-numeric-id';
import { ImagePreviewOverlay } from '../../../features/lesson-modal/ImagePreviewOverlay';
import { LessonContentTab } from '../../../features/lesson-modal/LessonContentTab';
import { LessonMeetButton } from '../../../components/backend/LessonMeetButton';
import { LessonPartyScheduleTimes } from '../../../components/lessons/LessonPartyScheduleTimes';
import { filterSafeFiles, formatMessage, getFilePlaceholder } from '../../../features/lesson-modal/fileUtils';
import {
  buildFilePreviewsFromLinks,
  buildFilePreviewsResolvingPending,
  buildMaterialPreviewsFromLesson,
} from '../../../lib/lesson-file-links';
import {
  pendingLessonFileKey,
  registerPendingLessonFile,
} from '../../../lib/lesson-pending-files';
import { resolveLessonPartyLabel } from '../../../lib/lesson-party-display';
import type { MaterialKind, MaterialKindOption } from '../../../features/lesson-modal/tabTypes';
import { toast } from '../../../features/notifications';
import styles from './page.module.scss';

function formatLongDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const rawLessonId = params?.lessonId;
  const lessonIdNum =
    rawLessonId !== undefined && rawLessonId !== '' ? Number(rawLessonId) : Number.NaN;
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const role = activeUser.role;
  const viewerPartyNumericId = useViewerPartyNumericId();
  const canManageLessons = canSchedule('lessons', role);
  const { lessons, setLessons } = useScheduledLessons();
  const [draft, setDraft] = useState<(typeof lessons)[number] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [materialsFileStatus, setMaterialsFileStatus] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [newMaterialText, setNewMaterialText] = useState('');
  const [newMaterialFiles, setNewMaterialFiles] = useState<string[]>([]);
  const [newMaterialKind, setNewMaterialKind] = useState<'text' | 'photo' | 'test' | 'file' | 'presentation'>('text');
  const [materialDraftPreviews, setMaterialDraftPreviews] = useState<Array<string | null>>([]);
  const [savedMaterialPreviews, setSavedMaterialPreviews] = useState<Record<string, Array<string | null>>>({});
  const [homeworkPreviews, setHomeworkPreviews] = useState<Array<string | null>>([]);
  const [studentResponsePreviews, setStudentResponsePreviews] = useState<Array<string | null>>([]);
  const materialsFileInputRef = useRef<HTMLInputElement | null>(null);
  const { studentOptions, teacherOptions, timezoneIanaByPartyId, nameByNumericId } =
    useLessonPartyOptions();
  const { persistUpdate } = useScheduledLessonPersistence();

  const lesson = useMemo(() => {
    if (Number.isFinite(lessonIdNum)) {
      const candidate = lessons.find((item) => item.id === lessonIdNum);
      if (candidate) {
        if (!lessonIncludesViewer(candidate, viewerPartyNumericId ?? activeUser.id, role)) {
          return null;
        }
        return candidate;
      }
    }
    if (rawLessonId) {
      const byBackendId = lessons.find(
        (item) => item.backendId === rawLessonId || lessonStringId(item.id) === rawLessonId,
      );
      if (byBackendId) {
        if (!lessonIncludesViewer(byBackendId, viewerPartyNumericId ?? activeUser.id, role)) {
          return null;
        }
        return byBackendId;
      }
    }
    return null;
  }, [lessonIdNum, lessons, rawLessonId, role, viewerPartyNumericId, activeUser.id]);
  const loadedLessonIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lesson) {
      setDraft(null);
      loadedLessonIdRef.current = null;
      return;
    }
    if (loadedLessonIdRef.current === lesson.id) return;
    loadedLessonIdRef.current = lesson.id;
    setDraft({
      ...lesson,
      materials: lesson.materials?.map((m) => ({ ...m, files: [...(m.files ?? [])] })) ?? [],
      homework: {
        text: lesson.homework?.text ?? '',
        files: [...(lesson.homework?.files ?? [])],
        fileLinks: lesson.homework?.fileLinks,
      },
      studentResponse: {
        text: lesson.studentResponse?.text ?? '',
        files: [...(lesson.studentResponse?.files ?? [])],
        fileLinks: lesson.studentResponse?.fileLinks,
        status: lesson.studentResponse?.status ?? 'not_submitted',
        homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
        teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? '',
      },
    });
  }, [lesson]);

  useEffect(() => {
    if (!draft) return;
    const teacherName = resolveLessonPartyLabel(
      draft.teacherId,
      draft.teacherName,
      nameByNumericId,
    );
    const studentName = resolveLessonPartyLabel(
      draft.studentId,
      draft.studentName,
      nameByNumericId,
      role === USER_ROLE.student.id ? activeUser.fullName : '—',
    );
    if (teacherName === draft.teacherName && studentName === draft.studentName) return;
    setDraft((prev) => (prev ? { ...prev, teacherName, studentName } : prev));
  }, [activeUser.fullName, draft?.id, draft?.studentId, draft?.studentName, draft?.teacherId, draft?.teacherName, nameByNumericId, role]);

  useEffect(() => {
    if (!lesson) return;
    setSavedMaterialPreviews(buildMaterialPreviewsFromLesson(lesson.materials));
    setMaterialDraftPreviews([]);
    setFileError(null);
    setMaterialsFileStatus(null);
  }, [lesson?.id]);

  useEffect(() => {
    if (!draft) return;
    setHomeworkPreviews((prev) =>
      buildFilePreviewsResolvingPending(
        draft.homework?.files ?? [],
        draft.homework?.fileLinks,
        prev,
      ),
    );
    setStudentResponsePreviews((prev) =>
      buildFilePreviewsResolvingPending(
        draft.studentResponse?.files ?? [],
        draft.studentResponse?.fileLinks,
        prev,
      ),
    );
  }, [
    draft?.homework?.files,
    draft?.homework?.fileLinks,
    draft?.studentResponse?.files,
    draft?.studentResponse?.fileLinks,
  ]);

  const statusLabel =
    draft?.statusId === LESSON_STATUS.planned.id
      ? 'Planned'
      : draft?.statusId === LESSON_STATUS.completed.id
        ? 'Completed'
        : 'Cancelled';
  const canStudentSubmitHomework =
    role === USER_ROLE.student.id &&
    draft?.statusId === LESSON_STATUS.completed.id;

  if (!lesson || !draft) return null;

  const lessonStudentBackendId =
    role === USER_ROLE.student.id
      ? auth?.user?.id ?? null
      : resolvePartyBackendId(draft.studentId, studentOptions, teacherOptions) ?? null;

  const teacherDisplayName = resolveLessonPartyLabel(
    draft.teacherId,
    draft.teacherName,
    nameByNumericId,
  );
  const studentDisplayName = resolveLessonPartyLabel(
    draft.studentId,
    draft.studentName,
    nameByNumericId,
    role === USER_ROLE.student.id ? activeUser.fullName : '—',
  );
  const summaryText = (draft.description ?? '').trim();
  const showSummaryBlock = canManageLessons || summaryText.length > 0;

  const applyUpdate = (next: typeof draft) => setDraft(next);
  const text = siteContent.calendar.lessonModal;
  const statusOrder: Array<typeof draft.statusId> = [
    LESSON_STATUS.planned.id,
    LESSON_STATUS.completed.id,
    LESSON_STATUS.cancelled.id,
  ];
  const handleStatusBadgeClick = () => {
    if (!canManageLessons) return;
    const currentIdx = statusOrder.indexOf(draft.statusId);
    const nextStatusId = statusOrder[(currentIdx + 1) % statusOrder.length];
    applyUpdate({
      ...draft,
      statusId: nextStatusId,
      cancelReason:
        nextStatusId === LESSON_STATUS.cancelled.id
          ? (draft.cancelReason ?? 'student_absent')
          : undefined,
      credited:
        nextStatusId === LESSON_STATUS.cancelled.id
          ? draft.credited
          : false,
    });
  };
  const materialKinds: MaterialKindOption[] = [
    { value: 'text', label: text.materialTypes.text, icon: FileText },
    { value: 'photo', label: text.materialTypes.photo, icon: Image },
    { value: 'test', label: text.materialTypes.test, icon: ClipboardCheck },
    { value: 'file', label: text.materialTypes.file, icon: File },
    { value: 'presentation', label: text.materialTypes.presentation, icon: Monitor },
  ];
  const materialDraft = { kind: newMaterialKind, text: newMaterialText, files: newMaterialFiles };
  const setMaterialDraft = (
    next:
      | { kind: MaterialKind; text: string; files: string[] }
      | ((prev: { kind: MaterialKind; text: string; files: string[] }) => { kind: MaterialKind; text: string; files: string[] }),
  ) => {
    const prev = { kind: newMaterialKind, text: newMaterialText, files: newMaterialFiles };
    const resolved = typeof next === 'function' ? next(prev) : next;
    setNewMaterialKind(resolved.kind);
    setNewMaterialText(resolved.text);
    setNewMaterialFiles(resolved.files);
  };
  const canSaveMaterial = newMaterialText.trim().length > 0 || newMaterialFiles.length > 0;
  const handleHomeworkFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) {
        if (item.file) {
          registerPendingLessonFile(pendingLessonFileKey('homework', 'main', item.name), item.file);
        }
      }
      applyUpdate({
        ...draft,
        homework: {
          text: draft.homework?.text ?? '',
          files: [...(draft.homework?.files ?? []), ...safe.map((item) => item.name)],
          fileLinks: draft.homework?.fileLinks,
        },
      });
      setHomeworkPreviews((prev) => [...prev, ...safe.map((item) => item.previewUrl)]);
    }
    setFileError(
      rejected.length > 0
        ? formatMessage(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb,
          })
        : null,
    );
  };
  const handleStudentResponseFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) {
        if (item.file) {
          registerPendingLessonFile(
            pendingLessonFileKey('response', 'main', item.name),
            item.file,
          );
        }
      }
      applyUpdate({
        ...draft,
        studentResponse: {
          text: draft.studentResponse?.text ?? '',
          files: [...(draft.studentResponse?.files ?? []), ...safe.map((item) => item.name)],
          fileLinks: draft.studentResponse?.fileLinks,
          status: draft.studentResponse?.status ?? 'submitted',
          homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
          teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? '',
        },
      });
      setStudentResponsePreviews((prev) => [...prev, ...safe.map((item) => item.previewUrl)]);
    }
    setFileError(
      rejected.length > 0
        ? formatMessage(text.messages.blockedUnsafeFiles, {
            files: rejected.join(', '),
            max: maxFileSizeMb,
          })
        : null,
    );
  };
  const handleMaterialsFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) {
        if (item.file) {
          registerPendingLessonFile(pendingLessonFileKey('material', 'draft', item.name), item.file);
        }
      }
      setMaterialDraft((prev) => ({
        ...prev,
        files: [...prev.files, ...safe.map((item) => item.name)],
      }));
      setMaterialDraftPreviews((prev) => [...prev, ...safe.map((item) => item.previewUrl)]);
    }
    if (rejected.length > 0) {
      setMaterialsFileStatus(formatMessage(text.messages.rejectedFiles, { files: rejected.join(', '), max: maxFileSizeMb }));
    } else {
      setMaterialsFileStatus(null);
    }
  };
  const saveAllLessonData = async () => {
    if (!canManageLessons || !draft || !lesson) return;
    const form = toLessonFormState({
      ...draft,
      endTime: calculateEndTime(draft.startTime, draft.duration),
    });
    const candidate = fromLessonFormState(form, {
      ...draft,
      endTime: calculateEndTime(draft.startTime, draft.duration),
    });
    const backendId = getLessonBackendId(lesson);
    if (!backendId) {
      toast.error('Could not save lesson', 'Lesson is not linked to the server yet. Refresh and try again.');
      return;
    }
    try {
      const persisted = await persistUpdate(
        { ...candidate, backendId },
        { ...lesson, backendId },
      );
      if (persisted) {
        setLessons((prev) => prev.map((item) => (item.id === persisted.id ? persisted : item)));
        setDraft(persisted);
        setSavedMaterialPreviews(buildMaterialPreviewsFromLesson(persisted.materials));
        setHomeworkPreviews(
          buildFilePreviewsFromLinks(persisted.homework?.files ?? [], persisted.homework?.fileLinks),
        );
        setStudentResponsePreviews(
          buildFilePreviewsFromLinks(
            persisted.studentResponse?.files ?? [],
            persisted.studentResponse?.fileLinks,
          ),
        );
        toast.success('Lesson saved');
        return;
      }
      toast.error('Could not save lesson', 'Lesson is not linked to the server yet. Refresh and try again.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save lesson';
      setFileError(message);
      toast.error('Could not save lesson', message);
    }
  };
  const saveStudentHomework = async () => {
    if (!canStudentSubmitHomework || !draft || !lesson) return;
    const form = toLessonFormState({
      ...draft,
      endTime: calculateEndTime(draft.startTime, draft.duration),
      studentResponse: {
        ...draft.studentResponse,
        text: draft.studentResponse?.text ?? '',
        files: [...(draft.studentResponse?.files ?? [])],
        status: 'submitted' as const,
      },
    });
    const candidate = fromLessonFormState(form, {
      ...draft,
      endTime: calculateEndTime(draft.startTime, draft.duration),
    });
    const backendId = getLessonBackendId(lesson);
    if (!backendId) {
      toast.error('Could not save response', 'Lesson is not linked to the server yet. Refresh and try again.');
      return;
    }
    try {
      const persisted = await persistUpdate(
        { ...candidate, backendId },
        { ...lesson, backendId },
      );
      if (persisted) {
        setLessons((prev) => prev.map((item) => (item.id === persisted.id ? persisted : item)));
        setDraft(persisted);
        setStudentResponsePreviews(
          buildFilePreviewsFromLinks(
            persisted.studentResponse?.files ?? [],
            persisted.studentResponse?.fileLinks,
          ),
        );
        toast.success('Response submitted');
        return;
      }
      toast.error('Could not save response', 'Lesson is not linked to the server yet. Refresh and try again.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save response';
      setFileError(message);
      toast.error('Could not save response', message);
    }
  };

  const persistLesson = () => {
    if (canManageLessons) return saveAllLessonData();
    if (canStudentSubmitHomework) return saveStudentHomework();
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={draft.title}
        subtitle="Edit lesson directly on this page"
      />

      <div className={styles.layout}>
        <SurfaceCard className={styles.sidebarCard}>
          <Link href="/lessons" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden />
            Back to lessons
          </Link>

          <div className={styles.heroBlock}>
            <div className={styles.heroIcon}>
              <BookOpen size={22} strokeWidth={2} />
            </div>
            <div className={styles.heroMain}>
              <div className={styles.heroTitleWrap}>
                <Field
                  as="input"
                  className={canManageLessons ? styles.heroTitleInput : styles.heroTitle}
                  value={draft.title}
                  readOnly={!canManageLessons}
                  onChange={(event) => applyUpdate({ ...draft, title: event.target.value })}
                />
              </div>
              <div className={styles.heroBadges}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleStatusBadgeClick}
                  disabled={!canManageLessons}
                  className={`${styles.statusBadge} ${draft.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${draft.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${draft.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
                >
                  {statusLabel}
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="calendar">
                <Calendar size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Date</span>
                <Field
                  type="date"
                  className={!canManageLessons ? styles.metaValue : undefined}
                  value={draft.date}
                  readOnly={!canManageLessons}
                  formatValue={(value) =>
                    typeof value === 'string' && value ? formatLongDate(value) : '—'
                  }
                  onChange={(event) => applyUpdate({ ...draft, date: event.target.value })}
                />
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="clock">
                <Clock3 size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Time</span>
                <div className={styles.inlineRow}>
                  <Field
                    type="time"
                    className={!canManageLessons ? styles.metaValue : undefined}
                    value={draft.startTime}
                    readOnly={!canManageLessons}
                    onChange={(event) => applyUpdate({ ...draft, startTime: event.target.value })}
                  />
                  <Field
                    type="number"
                    min={15}
                    step={5}
                    className={!canManageLessons ? styles.metaValue : undefined}
                    value={draft.duration}
                    readOnly={!canManageLessons}
                    formatValue={(value) => `${Number(value) || 0} min`}
                    onChange={(event) =>
                      applyUpdate({ ...draft, duration: Math.max(15, Number(event.target.value) || 15) })
                    }
                  />
                </div>
                {draft ? (
                  <LessonPartyScheduleTimes
                    wall={{
                      date: draft.date,
                      startTime: draft.startTime,
                      duration: draft.duration,
                      timezoneId: draft.timezoneId,
                    }}
                    role={role}
                    teacherTimezoneIana={timezoneIanaByPartyId.get(draft.teacherId)}
                    studentTimezoneIana={timezoneIanaByPartyId.get(draft.studentId)}
                    teacherName={teacherDisplayName}
                    studentName={studentDisplayName}
                  />
                ) : null}
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="teacher">
                <UserRound size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Teacher</span>
                <Field as="input" className={styles.metaValue} value={teacherDisplayName} readOnly />
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="student">
                <UserRound size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Student</span>
                {canManageLessons ? (
                  <div className={styles.metaSelectHost}>
                    <Field
                      as="select"
                      className={styles.metaSelect}
                      value={String(draft.studentId)}
                      onChange={(event) => {
                        const next = studentOptions.find((item) => item.id === Number(event.target.value));
                        if (!next) return;
                        applyUpdate({ ...draft, studentId: next.id, studentName: next.fullName });
                      }}
                    >
                      {studentOptions.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.fullName}
                        </option>
                      ))}
                    </Field>
                  </div>
                ) : (
                  <Field as="input" className={styles.metaValue} value={studentDisplayName} readOnly />
                )}
              </div>
            </div>
            {canManageLessons &&
            draft.statusId === LESSON_STATUS.cancelled.id ? (
              <>
                <div className={styles.metaRow}>
                  <span className={styles.metaIcon} data-accent="clock">
                    <Clock3 size={16} aria-hidden />
                  </span>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>Cancel reason</span>
                    <div className={styles.metaSelectHost}>
                      <Field as="select"
                        className={styles.metaSelect}
                        value={draft.cancelReason ?? 'student_absent'}
                        onChange={(event) =>
                        applyUpdate({
                          ...draft,
                          cancelReason: event.target.value as NonNullable<typeof draft.cancelReason>,
                        })
                      }
                    >
                      <option value="student_absent">Student absent</option>
                      <option value="student_requested_cancel">Student requested cancel</option>
                      <option value="teacher_absent">Teacher absent</option>
                      </Field>
                    </div>
                  </div>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaIcon} data-accent="teacher">
                    <UserRound size={16} aria-hidden />
                  </span>
                  <div className={styles.metaText}>
                    <span className={styles.metaLabel}>Credited</span>
                    <div className={styles.metaSelectHost}>
                      <Field as="select"
                        className={styles.metaSelect}
                        value={draft.credited ? 'yes' : 'no'}
                        onChange={(event) => applyUpdate({ ...draft, credited: event.target.value === 'yes' })}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </Field>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className={styles.sidebarActions}>
            <LessonMeetButton
              lessonBackendId={getLessonBackendId(lesson) ?? null}
              meetUrl={lesson.googleMeetUrl ?? null}
              fallbackClassName={styles.meetButton}
            />
            <Link href="/calendar" className={styles.calendarButton}>
              <Calendar size={17} />
              Open in Calendar
            </Link>
          </div>

          {showSummaryBlock ? (
            <div className={styles.descriptionWrap}>
              <Field
                as="textarea"
                className={!canManageLessons ? styles.description : undefined}
                rows={4}
                value={draft.description ?? ''}
                readOnly={!canManageLessons}
                placeholder="Short summary for this lesson hub…"
                onChange={(event) => applyUpdate({ ...draft, description: event.target.value })}
              />
            </div>
          ) : null}
          {canManageLessons || canStudentSubmitHomework ? (
            <Button
              type="button"
              className={styles.editLessonBtn}
              onClick={persistLesson}
              startIcon={<Save size={16} aria-hidden />}
              loadingLabel={canManageLessons ? 'Saving…' : 'Submitting…'}
              loadingAriaLabel={canManageLessons ? 'Saving lesson' : 'Submitting response'}
            >
              Save
            </Button>
          ) : null}
        </SurfaceCard>

        <div className={styles.content}>
          <LessonContentTab
              text={text}
              canEdit={canManageLessons}
              role={role}
              form={{
                title: draft.title,
                date: draft.date,
                startTime: draft.startTime,
                timezoneId: draft.timezoneId,
                duration: draft.duration,
                teacherId: draft.teacherId,
                teacherName: draft.teacherName,
                studentId: draft.studentId,
                studentName: draft.studentName,
                notes: draft.notes ?? '',
                lessonPlan: draft.lessonPlan ?? '',
                materials: draft.materials ?? [],
                homeworkText: draft.homework?.text ?? '',
                homeworkFiles: draft.homework?.files ?? [],
                homeworkFileLinks: draft.homework?.fileLinks,
                studentResponseText: draft.studentResponse?.text ?? '',
                studentResponseFiles: draft.studentResponse?.files ?? [],
                studentResponseFileLinks: draft.studentResponse?.fileLinks,
                studentResponseStatus: draft.studentResponse?.status ?? 'not_submitted',
                homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? '',
                statusId: draft.statusId,
                cancelReason: draft.cancelReason,
                credited: draft.credited,
                recurrence: draft.recurrence,
                weeklyDays: draft.weeklyDays ?? [],
                linkedWordIds: draft.linkedWordIds ?? [],
              }}
              lessonBackendId={getLessonBackendId(lesson) ?? null}
              studentBackendId={lessonStudentBackendId}
              materialKinds={materialKinds}
              materialDraft={materialDraft}
              setMaterialDraft={setMaterialDraft}
              materialDraftPreviews={materialDraftPreviews}
              setMaterialDraftPreviews={setMaterialDraftPreviews}
              savedMaterialPreviews={savedMaterialPreviews}
              setSavedMaterialPreviews={setSavedMaterialPreviews}
              homeworkPreviews={homeworkPreviews}
              setHomeworkPreviews={setHomeworkPreviews}
              studentResponsePreviews={studentResponsePreviews}
              setStudentResponsePreviews={setStudentResponsePreviews}
              materialsFileStatus={materialsFileStatus}
              canSaveMaterial={canSaveMaterial}
              materialsFileInputRef={materialsFileInputRef}
              getFilePlaceholder={getFilePlaceholder}
              setImagePreviewUrl={setImagePreviewUrl}
              onChange={(form) =>
                applyUpdate({
                  ...draft,
                  timezoneId: form.timezoneId,
                  lessonPlan: form.lessonPlan,
                  materials: form.materials,
                  linkedWordIds: form.linkedWordIds,
                  homework: {
                    text: form.homeworkText,
                    files: form.homeworkFiles,
                    fileLinks: form.homeworkFileLinks,
                  },
                  studentResponse: {
                    text: form.studentResponseText,
                    files: form.studentResponseFiles,
                    fileLinks: form.studentResponseFileLinks,
                    status: form.studentResponseStatus,
                    homeworkChecked: form.homeworkChecked,
                    teacherHomeworkFeedback: form.teacherHomeworkFeedback,
                  },
                })
              }
              onMaterialsFilesSelected={handleMaterialsFilesSelected}
              onHomeworkFilesSelected={handleHomeworkFilesSelected}
              onStudentResponseFilesSelected={handleStudentResponseFilesSelected}
              onSaveStudentResponse={saveStudentHomework}
              hideStudentSaveButton
            />
          {fileError ? <div className={styles.fileError}>{fileError}</div> : null}
        </div>
      </div>
      <ImagePreviewOverlay imagePreviewUrl={imagePreviewUrl} text={text} onClose={() => setImagePreviewUrl(null)} />
    </div>
  );
}
