'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Button, Tabs } from '../../components/ui';
import type { LessonFormState, LessonModalMode } from './types';
import { siteContent, USER_ROLE, type MockStudent, type UserRole } from '../../mocks';
import styles from './LessonModal.module.scss';
import { ImagePreviewOverlay } from './ImagePreviewOverlay';
import { LessonContentTab } from './LessonContentTab';
import { LessonModalHeader } from './LessonModalHeader';
import { LessonSetupTab } from './LessonSetupTab';
import { filterSafeFiles, formatMessage, getFilePlaceholder } from './fileUtils';
import type { MaterialKind, MaterialKindOption } from './tabTypes';
import { ClipboardCheck, File, FileText, Image, Monitor } from 'lucide-react';

export function LessonModal({
  mode,
  canEdit,
  form,
  onChange,
  onClose,
  onSubmit,
  onSaveStudentResponse,
  students,
  teachers,
  role,
  canUnlinkSeries,
  onUnlinkSeries,
  canDeleteLesson,
  onDeleteLesson,
  persistedLessonId = null,
}: {
  mode: LessonModalMode;
  canEdit: boolean;
  form: LessonFormState;
  onChange: (next: LessonFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  onSaveStudentResponse: () => void;
  students: MockStudent[];
  teachers: Array<{ id: number; fullName: string }>;
  role: UserRole;
  canUnlinkSeries: boolean;
  onUnlinkSeries: () => void;
  canDeleteLesson: boolean;
  onDeleteLesson: () => void;
  /** Set when editing an existing lesson so vocabulary can link to profile immediately. */
  persistedLessonId?: number | null;
}) {
  const text = siteContent.calendar.lessonModal;
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'setup' | 'content'>('setup');
  const [fileError, setFileError] = useState<string | null>(null);
  const [materialsFileStatus, setMaterialsFileStatus] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const materialsFileInputRef = useRef<HTMLInputElement | null>(null);
  const [materialDraft, setMaterialDraft] = useState<{
    kind: MaterialKind;
    text: string;
    files: string[];
  }>({
    kind: 'text',
    text: '',
    files: [],
  });
  const [materialDraftPreviews, setMaterialDraftPreviews] = useState<Array<string | null>>([]);
  const [savedMaterialPreviews, setSavedMaterialPreviews] = useState<Record<string, Array<string | null>>>({});
  const [homeworkPreviews, setHomeworkPreviews] = useState<Array<string | null>>([]);
  const [studentResponsePreviews, setStudentResponsePreviews] = useState<Array<string | null>>([]);
  const weekDayOptions = [
    { value: 1, label: text.weekDays.mon },
    { value: 2, label: text.weekDays.tue },
    { value: 3, label: text.weekDays.wed },
    { value: 4, label: text.weekDays.thu },
    { value: 5, label: text.weekDays.fri },
    { value: 6, label: text.weekDays.sat },
    { value: 7, label: text.weekDays.sun },
  ];
  const handleHomeworkFilesSelected = (files: FileList | null) => {
    const { safe, rejected, maxFileSizeMb } = filterSafeFiles(files);
    if (safe.length > 0) {
      onChange({
        ...form,
        homeworkFiles: [...form.homeworkFiles, ...safe.map((item) => item.name)],
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
      onChange({
        ...form,
        studentResponseFiles: [...form.studentResponseFiles, ...safe.map((item) => item.name)],
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
  const materialKinds: MaterialKindOption[] = [
    { value: 'text', label: text.materialTypes.text, icon: FileText },
    { value: 'photo', label: text.materialTypes.photo, icon: Image },
    { value: 'test', label: text.materialTypes.test, icon: ClipboardCheck },
    { value: 'file', label: text.materialTypes.file, icon: File },
    { value: 'presentation', label: text.materialTypes.presentation, icon: Monitor },
  ];
  const canSaveMaterial = materialDraft.text.trim().length > 0 || materialDraft.files.length > 0;
  const showLessonLink = Boolean(persistedLessonId);
  const showConfirmButton = role !== USER_ROLE.student.id;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setImagePreviewUrl(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <LessonModalHeader
          mode={mode}
          role={role}
          text={text}
          canUnlinkSeries={canUnlinkSeries}
          onUnlinkSeries={onUnlinkSeries}
          canDeleteLesson={canDeleteLesson}
          onDeleteLesson={onDeleteLesson}
          onClose={onClose}
        />
        <div className={styles.modalScroll}>
          <Tabs
            value={tab}
            onValueChange={setTab}
            ariaLabel={text.aria.sections}
            className={styles.modalTabsRoot}
            listClassName={styles.modalTabsList}
            triggerClassName={styles.modalTabsTrigger}
            activeTriggerClassName={styles.modalTabsTriggerActive}
            panelClassName={styles.modalTabsPanel}
            items={[
              {
                value: 'setup',
                label: text.sections.setup,
                panel: (
                  <LessonSetupTab
                    text={text}
                    canEdit={canEdit}
                    role={role}
                    form={form}
                    students={students}
                    teachers={teachers}
                    weekDayOptions={weekDayOptions}
                    onChange={onChange}
                  />
                ),
              },
              {
                value: 'content',
                label: text.sections.content,
                panel: <LessonContentTab
                  text={text}
                  canEdit={canEdit}
                  role={role}
                  form={form}
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
                  onChange={onChange}
                  onMaterialsFilesSelected={handleMaterialsFilesSelected}
                  onHomeworkFilesSelected={handleHomeworkFilesSelected}
                  onStudentResponseFilesSelected={handleStudentResponseFilesSelected}
                  onSaveStudentResponse={onSaveStudentResponse}
                  lessonEntityId={persistedLessonId}
                />,
              },
            ]}
          />
          {fileError ? <div className={styles.fileError}>{fileError}</div> : null}
        </div>
        <div
          className={[
            styles.modalActions,
            showLessonLink && showConfirmButton ? styles.modalActionsWithLink : styles.modalActionsSingle,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.modalActionsHint}>
            {role === USER_ROLE.student.id
              ? 'You can review lesson details and submit your response.'
              : 'Changes are applied immediately after saving.'}
          </div>
          {showLessonLink ? (
            <Link href={`/lessons/${persistedLessonId}`} className={styles.modalLessonLinkBtn} onClick={onClose}>
              Open lesson page
            </Link>
          ) : null}
          {showConfirmButton ? (
            <Button type="button" className={styles.modalConfirmBtn} onClick={onSubmit} disabled={!canEdit}>
              {mode === 'create' ? text.actions.saveLesson : text.actions.updateLesson}
            </Button>
          ) : null}
        </div>
      </div>
      <ImagePreviewOverlay imagePreviewUrl={imagePreviewUrl} text={text} onClose={() => setImagePreviewUrl(null)} />
    </div>,
    document.body,
  );
}
