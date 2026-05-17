'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { LESSON_STATUS } from '@soenglish/shared-types';
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
import { AdaptiveSelect, Button, Field, PageHeader, SurfaceCard } from '../../../components/ui';
import {
  canSchedule,
  canView,
  siteContent,
  USER_ROLE,
} from '../../../mocks';
import { useActiveUser } from '../../../lib/active-user';
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
import { filterSafeFiles, formatMessage, getFilePlaceholder } from '../../../features/lesson-modal/fileUtils';
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
  const role = activeUser.role;
  const viewerPartyNumericId = useViewerPartyNumericId();
  const hasAccess = canView('dashboard', role);
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
  const { studentOptions, teacherOptions } = useLessonPartyOptions();
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
      },
      studentResponse: {
        text: lesson.studentResponse?.text ?? '',
        files: [...(lesson.studentResponse?.files ?? [])],
        status: lesson.studentResponse?.status ?? 'not_submitted',
        homeworkChecked: lesson.studentResponse?.homeworkChecked ?? false,
        teacherHomeworkFeedback: lesson.studentResponse?.teacherHomeworkFeedback ?? '',
      },
    });
  }, [lesson]);
  useEffect(() => {
    setMaterialDraftPreviews([]);
    setSavedMaterialPreviews({});
    setHomeworkPreviews([]);
    setStudentResponsePreviews([]);
    setFileError(null);
    setMaterialsFileStatus(null);
  }, [lesson?.id]);

  const statusLabel =
    draft?.statusId === LESSON_STATUS.planned.id
      ? 'Planned'
      : draft?.statusId === LESSON_STATUS.completed.id
        ? 'Completed'
        : 'Cancelled';
  const canStudentSubmitHomework =
    role === USER_ROLE.student.id &&
    draft?.statusId === LESSON_STATUS.completed.id;

  if (!hasAccess || !lesson || !draft) return null;

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
      applyUpdate({
        ...draft,
        homework: {
          text: draft.homework?.text ?? '',
          files: [...(draft.homework?.files ?? []), ...safe.map((item) => item.name)],
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
      applyUpdate({
        ...draft,
        studentResponse: {
          text: draft.studentResponse?.text ?? '',
          files: [...(draft.studentResponse?.files ?? []), ...safe.map((item) => item.name)],
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
    if (canManageLessons) saveAllLessonData();
    else if (canStudentSubmitHomework) saveStudentHomework();
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
                <button
                  type="button"
                  onClick={handleStatusBadgeClick}
                  disabled={!canManageLessons}
                  className={`${styles.statusBadge} ${draft.statusId === LESSON_STATUS.planned.id ? styles.statusPlanned : ''} ${draft.statusId === LESSON_STATUS.completed.id ? styles.statusCompleted : ''} ${draft.statusId === LESSON_STATUS.cancelled.id ? styles.statusCancelled : ''}`}
                >
                  {statusLabel}
                </button>
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
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="teacher">
                <UserRound size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Teacher</span>
                <Field
                  as="input"
                  className={styles.metaValue}
                  value={lesson.teacherName}
                  readOnly
                />
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaIcon} data-accent="student">
                <UserRound size={16} aria-hidden />
              </span>
              <div className={styles.metaText}>
                <span className={styles.metaLabel}>Student</span>
                <div className={styles.metaSelectHost}>
                  <AdaptiveSelect
                    className={canManageLessons ? styles.metaSelect : styles.metaValue}
                    value={String(draft.studentId)}
                    readOnly={!canManageLessons}
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
                  </AdaptiveSelect>
                </div>
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
                      <AdaptiveSelect
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
                      </AdaptiveSelect>
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
                      <AdaptiveSelect
                        className={styles.metaSelect}
                        value={draft.credited ? 'yes' : 'no'}
                        onChange={(event) => applyUpdate({ ...draft, credited: event.target.value === 'yes' })}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </AdaptiveSelect>
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

          <div className={styles.descriptionWrap}>
            <Field
              as="textarea"
              className={!canManageLessons ? styles.description : undefined}
              rows={4}
              value={draft.description ?? ''}
              readOnly={!canManageLessons}
              formatValue={(value) =>
                value && String(value).trim().length > 0
                  ? String(value)
                  : lesson.notes ??
                    'Materials and homework are listed on the right — use this page as your lesson hub.'
              }
              placeholder="Short summary for this lesson hub…"
              onChange={(event) => applyUpdate({ ...draft, description: event.target.value })}
            />
          </div>
          {canManageLessons || canStudentSubmitHomework ? (
            <Button type="button" className={styles.editLessonBtn} onClick={persistLesson}>
              <Save size={16} />
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
                studentResponseText: draft.studentResponse?.text ?? '',
                studentResponseFiles: draft.studentResponse?.files ?? [],
                studentResponseStatus: draft.studentResponse?.status ?? 'not_submitted',
                homeworkChecked: draft.studentResponse?.homeworkChecked ?? false,
                teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? '',
                statusId: draft.statusId,
                cancelReason: draft.cancelReason,
                credited: draft.credited,
                recurrence: draft.recurrence,
                weeklyDays: draft.weeklyDays ?? [],
                applyToSeries: false,
                linkedWordIds: draft.linkedWordIds ?? [],
              }}
              lessonBackendId={getLessonBackendId(lesson) ?? null}
              studentBackendId={
                resolvePartyBackendId(draft.studentId, studentOptions, teacherOptions) ?? null
              }
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
                  },
                  studentResponse: {
                    text: form.studentResponseText,
                    files: form.studentResponseFiles,
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
