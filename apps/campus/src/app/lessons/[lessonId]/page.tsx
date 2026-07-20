'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { LESSON_STATUS } from '@pkg/types';
import { PageHeader } from '../../../components/ui';
import { canSchedule } from '../../../lib/roles';
import { USER_ROLE } from '@pkg/types';
import { useActiveUser } from '../../../lib/active-user';
import { buildLessonModalCopy, useCampusI18n, useCampusT } from '../../../lib/cms';
import { useOptionalAuth } from '../../../lib/auth-context';
import { calculateEndTime, fromLessonFormState, toLessonFormState } from '../../../features/calendar/adapters/lessonCalendarAdapter';
import { useScheduledLessons } from '../../../features/lesson-modal';
import { useLessonPartyOptions } from '../../../hooks/use-lesson-party-options';
import { useScheduledLessonPersistence } from '../../../hooks/use-scheduled-lesson-persistence';
import { resolvePartyBackendId } from '../../../features/lesson-modal/lessonPersistence';
import { getLessonBackendId, lessonIncludesViewer, lessonStringId } from '../../../features/lesson-modal/scheduledLessonsBackendAdapter';
import { useViewerPartyNumericId } from '../../../hooks/use-viewer-party-numeric-id';
import { ImagePreviewOverlay } from '../../../features/lesson-modal/ImagePreviewOverlay';
import { filterSafeFiles, formatMessage, getFilePlaceholder } from '../../../features/lesson-modal/fileUtils';
import { buildFilePreviewsFromLinks, buildFilePreviewsResolvingPending, buildMaterialPreviewsFromLesson } from '../../../lib/lesson-file-links';
import { pendingLessonFileKey, registerPendingLessonFile } from '../../../lib/lesson-pending-files';
import { resolveLessonPartyLabel } from '../../../lib/lesson-party-display';
import type { MaterialKind } from '../../../features/lesson-modal/tabTypes';
import { LESSON_MATERIAL_KIND_OPTIONS } from '../../../features/lesson-modal/lesson-material-kinds';
import { toast } from '../../../features/notifications';
import { useVocabularyStore } from '../../../stores/vocabulary-store';
import { LessonSidebar } from './LessonSidebar';
import { LessonWorkspacePanel } from './LessonWorkspacePanel';
import { lessonPageSubtitle } from './lesson-page-utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './page.module.scss';

export default function LessonPage() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const text = useMemo(() => buildLessonModalCopy(t), [t]);
  const params = useParams<{ lessonId: string }>();
  const rawLessonId = params?.lessonId;
  const lessonIdNum = rawLessonId !== undefined && rawLessonId !== '' ? Number(rawLessonId) : Number.NaN;
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const role = activeUser.role;
  const viewerPartyNumericId = useViewerPartyNumericId();
  const canManageLessons = canSchedule('lessons', role);
  const canReassignTeacher = role === USER_ROLE.admin.id || role === USER_ROLE.superAdmin.id;
  const { lessons, setLessons } = useScheduledLessons();
  const vocabCards = useVocabularyStore((s) => s.cards.data);
  const [draft, setDraft] = useState<(typeof lessons)[number] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [materialsFileStatus, setMaterialsFileStatus] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [newMaterialText, setNewMaterialText] = useState('');
  const [newMaterialFiles, setNewMaterialFiles] = useState<string[]>([]);
  const [newMaterialKind, setNewMaterialKind] = useState<MaterialKind>('text');
  const [materialDraftPreviews, setMaterialDraftPreviews] = useState<Array<string | null>>([]);
  const [savedMaterialPreviews, setSavedMaterialPreviews] = useState<Record<string, Array<string | null>>>({});
  const [homeworkPreviews, setHomeworkPreviews] = useState<Array<string | null>>([]);
  const [studentResponsePreviews, setStudentResponsePreviews] = useState<Array<string | null>>([]);
  const materialsFileInputRef = useRef<HTMLInputElement | null>(null);
  const { studentOptions, teacherOptions, timezoneIanaByPartyId, nameByNumericId } = useLessonPartyOptions();
  const { persistUpdate } = useScheduledLessonPersistence();

  const lesson = useMemo(() => {
    if (Number.isFinite(lessonIdNum)) {
      const candidate = lessons.find((item) => item.id === lessonIdNum);
      if (candidate) {
        return lessonIncludesViewer(candidate, viewerPartyNumericId ?? activeUser.id, role) ? candidate : null;
      }
    }
    if (rawLessonId) {
      const byBackendId = lessons.find((item) => item.backendId === rawLessonId || lessonStringId(item.id) === rawLessonId);
      if (byBackendId) {
        return lessonIncludesViewer(byBackendId, viewerPartyNumericId ?? activeUser.id, role) ? byBackendId : null;
      }
    }
    return null;
  }, [lessonIdNum, lessons, rawLessonId, role, viewerPartyNumericId, activeUser.id]);

  const loadedLessonIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lesson) { setDraft(null); loadedLessonIdRef.current = null; return; }
    if (loadedLessonIdRef.current === lesson.id) return;
    loadedLessonIdRef.current = lesson.id;
    setDraft({
      ...lesson,
      materials: lesson.materials?.map((m) => ({ ...m, files: [...(m.files ?? [])] })) ?? [],
      homework: { text: lesson.homework?.text ?? '', files: [...(lesson.homework?.files ?? [])], fileLinks: lesson.homework?.fileLinks },
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
    const teacherName = resolveLessonPartyLabel(draft.teacherId, draft.teacherName, nameByNumericId);
    const studentName = resolveLessonPartyLabel(draft.studentId, draft.studentName, nameByNumericId, role === USER_ROLE.student.id ? activeUser.fullName : '—');
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
    setHomeworkPreviews((prev) => buildFilePreviewsResolvingPending(draft.homework?.files ?? [], draft.homework?.fileLinks, prev));
    setStudentResponsePreviews((prev) => buildFilePreviewsResolvingPending(draft.studentResponse?.files ?? [], draft.studentResponse?.fileLinks, prev));
  }, [draft?.homework?.files, draft?.homework?.fileLinks, draft?.studentResponse?.files, draft?.studentResponse?.fileLinks]);

  if (!lesson || !draft) return null;

  const statusLabel =
    draft.statusId === LESSON_STATUS.planned.id
      ? t('dashboard.lessonStatus.planned')
      : draft.statusId === LESSON_STATUS.completed.id
        ? t('dashboard.lessonStatus.completed')
        : t('dashboard.lessonStatus.cancelled');
  const viewerIsLessonStudent = draft.studentId === viewerPartyNumericId || (draft.participantIds?.includes(viewerPartyNumericId ?? -1) ?? false);
  const canStudentSubmitHomework = role === USER_ROLE.student.id && viewerIsLessonStudent && draft.statusId === LESSON_STATUS.completed.id;

  const previousStudentLesson = (() => {
    const wall = `${draft.date}T${draft.startTime}`;
    return lessons
      .filter((item) => item.id !== draft.id && item.studentId === draft.studentId)
      .filter((item) => `${item.date}T${item.startTime}` < wall)
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`))[0] ?? null;
  })();

  const materialKinds = LESSON_MATERIAL_KIND_OPTIONS.map((option) => ({
    ...option,
    label: text.materialTypes[option.value as keyof typeof text.materialTypes] ?? option.label,
  }));

  const lessonStudentBackendId =
    role === USER_ROLE.student.id
      ? auth?.user?.id ?? null
      : resolvePartyBackendId(draft.studentId, studentOptions, teacherOptions) ?? null;

  const teacherDisplayName = resolveLessonPartyLabel(draft.teacherId, draft.teacherName, nameByNumericId);
  const studentDisplayName = resolveLessonPartyLabel(draft.studentId, draft.studentName, nameByNumericId, role === USER_ROLE.student.id ? activeUser.fullName : '—');
  const summaryText = (draft.description ?? '').trim();
  const showSummaryBlock = canManageLessons || summaryText.length > 0;

  const materialDraft = { kind: newMaterialKind, text: newMaterialText, files: newMaterialFiles };
  const setMaterialDraft = (
    next: typeof materialDraft | ((prev: typeof materialDraft) => typeof materialDraft),
  ) => {
    const prev = { kind: newMaterialKind, text: newMaterialText, files: newMaterialFiles };
    const resolved = typeof next === 'function' ? next(prev) : next;
    setNewMaterialKind(resolved.kind);
    setNewMaterialText(resolved.text);
    setNewMaterialFiles(resolved.files);
  };
  const canSaveMaterial = newMaterialText.trim().length > 0 || newMaterialFiles.length > 0;

  const statusOrder: Array<typeof draft.statusId> = [LESSON_STATUS.planned.id, LESSON_STATUS.completed.id, LESSON_STATUS.cancelled.id];
  const handleStatusBadgeClick = () => {
    if (!canManageLessons) return;
    const nextStatusId = statusOrder[(statusOrder.indexOf(draft.statusId) + 1) % statusOrder.length];
    setDraft({ ...draft, statusId: nextStatusId, cancelReason: nextStatusId === LESSON_STATUS.cancelled.id ? (draft.cancelReason ?? 'student_absent') : undefined, credited: nextStatusId === LESSON_STATUS.cancelled.id ? draft.credited : false });
  };

  const handleHomeworkFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) if (item.file) registerPendingLessonFile(pendingLessonFileKey('homework', 'main', item.name), item.file);
      setDraft({ ...draft, homework: { text: draft.homework?.text ?? '', files: [...(draft.homework?.files ?? []), ...safe.map((i) => i.name)], fileLinks: draft.homework?.fileLinks } });
      setHomeworkPreviews((prev) => [...prev, ...safe.map((i) => i.previewUrl)]);
    }
    setFileError(rejected.length > 0 ? formatMessage(text.messages.blockedUnsafeFiles, { files: rejected.join(', '), max: maxFileSizeMb }) : null);
  };

  const handleStudentResponseFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) if (item.file) registerPendingLessonFile(pendingLessonFileKey('response', 'main', item.name), item.file);
      setDraft({ ...draft, studentResponse: { text: draft.studentResponse?.text ?? '', files: [...(draft.studentResponse?.files ?? []), ...safe.map((i) => i.name)], fileLinks: draft.studentResponse?.fileLinks, status: draft.studentResponse?.status ?? 'submitted', homeworkChecked: draft.studentResponse?.homeworkChecked ?? false, teacherHomeworkFeedback: draft.studentResponse?.teacherHomeworkFeedback ?? '' } });
      setStudentResponsePreviews((prev) => [...prev, ...safe.map((i) => i.previewUrl)]);
    }
    setFileError(rejected.length > 0 ? formatMessage(text.messages.blockedUnsafeFiles, { files: rejected.join(', '), max: maxFileSizeMb }) : null);
  };

  const handleMaterialsFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      for (const item of safe) if (item.file) registerPendingLessonFile(pendingLessonFileKey('material', 'draft', item.name), item.file);
      setMaterialDraft((prev) => ({ ...prev, files: [...prev.files, ...safe.map((i) => i.name)] }));
      setMaterialDraftPreviews((prev) => [...prev, ...safe.map((i) => i.previewUrl)]);
    }
    setMaterialsFileStatus(rejected.length > 0 ? formatMessage(text.messages.rejectedFiles, { files: rejected.join(', '), max: maxFileSizeMb }) : null);
  };

  const saveAllLessonData = async () => {
    if (!canManageLessons || !lesson) return;
    const form = toLessonFormState({ ...draft, endTime: calculateEndTime(draft.startTime, draft.duration) });
    const candidate = fromLessonFormState(form, { ...draft, endTime: calculateEndTime(draft.startTime, draft.duration) });
    const backendId = getLessonBackendId(lesson);
    if (!backendId) {
      toast.error(t('lessonDetail.toast.saveFail'), t('lessonDetail.toast.notLinked'));
      return;
    }
    try {
      const persisted = await persistUpdate({ ...candidate, backendId }, { ...lesson, backendId });
      if (persisted) {
        setLessons((prev) => prev.map((item) => (item.id === persisted.id ? persisted : item)));
        setDraft(persisted);
        setSavedMaterialPreviews(buildMaterialPreviewsFromLesson(persisted.materials));
        setHomeworkPreviews(buildFilePreviewsFromLinks(persisted.homework?.files ?? [], persisted.homework?.fileLinks));
        setStudentResponsePreviews(buildFilePreviewsFromLinks(persisted.studentResponse?.files ?? [], persisted.studentResponse?.fileLinks));
        toast.success(t('lessonDetail.toast.saveOk'));
        return;
      }
      toast.error(t('lessonDetail.toast.saveFail'), t('lessonDetail.toast.notLinked'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('lessonDetail.toast.saveFailed');
      setFileError(message);
      toast.error(t('lessonDetail.toast.saveFail'), message);
    }
  };

  const saveStudentHomework = async () => {
    if (!canStudentSubmitHomework || !lesson) return;
    const form = toLessonFormState({ ...draft, endTime: calculateEndTime(draft.startTime, draft.duration), studentResponse: { ...draft.studentResponse, text: draft.studentResponse?.text ?? '', files: [...(draft.studentResponse?.files ?? [])], status: 'submitted' as const } });
    const candidate = fromLessonFormState(form, { ...draft, endTime: calculateEndTime(draft.startTime, draft.duration) });
    const backendId = getLessonBackendId(lesson);
    if (!backendId) {
      toast.error(t('lessonDetail.toast.responseFail'), t('lessonDetail.toast.notLinked'));
      return;
    }
    try {
      const persisted = await persistUpdate({ ...candidate, backendId }, { ...lesson, backendId });
      if (persisted) {
        setLessons((prev) => prev.map((item) => (item.id === persisted.id ? persisted : item)));
        setDraft(persisted);
        setStudentResponsePreviews(buildFilePreviewsFromLinks(persisted.studentResponse?.files ?? [], persisted.studentResponse?.fileLinks));
        toast.success(t('lessonDetail.toast.responseOk'));
        return;
      }
      toast.error(t('lessonDetail.toast.responseFail'), t('lessonDetail.toast.notLinked'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('lessonDetail.toast.responseFailed');
      setFileError(message);
      toast.error(t('lessonDetail.toast.responseFail'), message);
    }
  };

  const persistLesson = () => {
    if (canManageLessons) return saveAllLessonData();
    if (canStudentSubmitHomework) return saveStudentHomework();
  };

  const calendarHref = `/calendar?${new URLSearchParams({ date: draft.date, lessonId: String(draft.id), focus: '1' }).toString()}`;
  const pageSubtitle = lessonPageSubtitle(
    draft,
    statusLabel,
    canManageLessons ? t('lessonDetail.hub.staff') : t('lessonDetail.hub.student'),
    locale,
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={
          <span className={styles.pageTitleRow}>
            <Link href="/lessons" className={styles.backLink} aria-label={t('lessonDetail.backAria')}>
              <ArrowLeft size={16} aria-hidden />
            </Link>
            <span className={styles.pageTitleText}>{draft.title}</span>
          </span>
        }
        subtitle={pageSubtitle}
      />
      <div className={styles.layout}>
        <LessonSidebar
          draft={draft}
          lesson={lesson}
          canManageLessons={canManageLessons}
          canReassignTeacher={canReassignTeacher}
          canStudentSubmitHomework={canStudentSubmitHomework}
          statusLabel={statusLabel}
          teacherDisplayName={teacherDisplayName}
          studentDisplayName={studentDisplayName}
          showSummaryBlock={showSummaryBlock}
          calendarHref={calendarHref}
          role={role}
          teacherOptions={teacherOptions}
          studentOptions={studentOptions}
          timezoneIanaByPartyId={timezoneIanaByPartyId}
          onUpdate={setDraft}
          onStatusBadgeClick={handleStatusBadgeClick}
          onPersistLesson={() => void persistLesson()}
        />
        <LessonWorkspacePanel
          draft={draft}
          lesson={lesson}
          canManageLessons={canManageLessons}
          canStudentSubmitHomework={canStudentSubmitHomework}
          role={role}
          text={text}
          previous={{
            previousHomeworkText: (previousStudentLesson?.homework?.text ?? '').trim(),
            previousHomeworkFilesCount: previousStudentLesson?.homework?.files?.length ?? 0,
            previousResponseSubmitted: previousStudentLesson?.studentResponse?.status === 'submitted',
            previousVocabularyWords: (previousStudentLesson?.linkedWordIds ?? []).map((id) => vocabCards?.find((c) => c.id === id)?.word.text ?? id).slice(0, 6),
            hasPreviousLesson: previousStudentLesson !== null,
          }}
          teacherDisplayName={teacherDisplayName}
          studentDisplayName={studentDisplayName}
          lessonStudentBackendId={lessonStudentBackendId}
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
          fileError={fileError}
          setImagePreviewUrl={setImagePreviewUrl}
          getFilePlaceholder={getFilePlaceholder}
          onUpdate={setDraft}
          onMaterialsFilesSelected={handleMaterialsFilesSelected}
          onHomeworkFilesSelected={handleHomeworkFilesSelected}
          onStudentResponseFilesSelected={handleStudentResponseFilesSelected}
          onSaveStudentResponse={() => void saveStudentHomework()}
        />
      </div>
      <ImagePreviewOverlay imagePreviewUrl={imagePreviewUrl} text={text} onClose={() => setImagePreviewUrl(null)} />
    </div>
  );
}
