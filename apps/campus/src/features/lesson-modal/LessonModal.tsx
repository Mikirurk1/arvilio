'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LessonFieldErrors } from './tabTypes';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Button, Tabs } from '../../components/ui';
import type { LessonFormState, LessonModalMode } from './types';
import { USER_ROLE, type UserRoleId } from '@pkg/types';
import { buildLessonModalCopy, useCampusT } from '../../lib/cms';
import type { LessonPartyOption } from '../../hooks/use-lesson-party-options';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import styles from './LessonModal.module.scss';
import { ImagePreviewOverlay } from './ImagePreviewOverlay';
import { LessonContentTab } from './LessonContentTab';
import { LessonModalHeader } from './LessonModalHeader';
import { LessonSetupTab } from './LessonSetupTab';
import {
  buildFilePreviewsFromLinks,
  buildMaterialPreviewsFromLesson,
} from '../../lib/lesson-file-links';
import {
  movePendingLessonFiles,
  pendingLessonFileKey,
  registerPendingLessonFile,
} from '../../lib/lesson-pending-files';
import {
  filterSafeFiles,
  formatMessage,
  getFilePlaceholder,
} from './fileUtils';
import type { MaterialKind } from './tabTypes';
import { LESSON_MATERIAL_KIND_OPTIONS } from './lesson-material-kinds';

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
  canDeleteSeries,
  onDeleteSeries,
  canDeleteLesson,
  onDeleteLesson,
  recurrenceAllowed = true,
  persistedLessonId = null,
  lessonBackendId = null,
  studentBackendId = null,
  isSaving = false,
}: {
  mode: LessonModalMode;
  canEdit: boolean;
  form: LessonFormState;
  onChange: (next: LessonFormState) => void;
  onClose: () => void;
  onSubmit: (formOverride?: LessonFormState) => void | Promise<void>;
  onSaveStudentResponse: () => void;
  students: LessonPartyOption[];
  teachers: LessonPartyOption[];
  role: UserRoleId;
  canUnlinkSeries: boolean;
  onUnlinkSeries: () => void;
  canDeleteSeries: boolean;
  onDeleteSeries: () => void;
  canDeleteLesson: boolean;
  onDeleteLesson: () => void;
  recurrenceAllowed?: boolean;
  /** @deprecated Numeric lesson id — prefer lessonBackendId. */
  persistedLessonId?: number | null;
  lessonBackendId?: string | null;
  studentBackendId?: string | null;
  isSaving?: boolean;
}) {
  const t = useCampusT();
  const text = useMemo(() => buildLessonModalCopy(t), [t]);
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'setup' | 'content'>('setup');
  const [fieldErrors, setFieldErrors] = useState<LessonFieldErrors>({});
  const modalRef = useRef<HTMLDivElement | null>(null);
  const setupPanelRef = useRef<HTMLDivElement | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [materialsFileStatus, setMaterialsFileStatus] = useState<string | null>(
    null,
  );
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
  const [materialDraftPreviews, setMaterialDraftPreviews] = useState<
    Array<string | null>
  >([]);
  const [savedMaterialPreviews, setSavedMaterialPreviews] = useState<
    Record<string, Array<string | null>>
  >({});
  const [homeworkPreviews, setHomeworkPreviews] = useState<
    Array<string | null>
  >([]);
  const [studentResponsePreviews, setStudentResponsePreviews] = useState<
    Array<string | null>
  >([]);
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
      for (const item of safe) {
        if (item.file) {
          registerPendingLessonFile(pendingLessonFileKey('homework', 'main', item.name), item.file);
        }
      }
      onChange({
        ...form,
        homeworkFiles: [...form.homeworkFiles, ...safe.map(item => item.name)],
      });
      setHomeworkPreviews(prev => [
        ...prev,
        ...safe.map(item => item.previewUrl),
      ]);
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
      onChange({
        ...form,
        studentResponseFiles: [
          ...form.studentResponseFiles,
          ...safe.map(item => item.name),
        ],
      });
      setStudentResponsePreviews(prev => [
        ...prev,
        ...safe.map(item => item.previewUrl),
      ]);
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
      setMaterialDraft(prev => ({
        ...prev,
        files: [...prev.files, ...safe.map(item => item.name)],
      }));
      setMaterialDraftPreviews(prev => [
        ...prev,
        ...safe.map(item => item.previewUrl),
      ]);
    }
    if (rejected.length > 0) {
      setMaterialsFileStatus(
        formatMessage(text.messages.rejectedFiles, {
          files: rejected.join(', '),
          max: maxFileSizeMb,
        }),
      );
    } else {
      setMaterialsFileStatus(null);
    }
  };
  const materialKinds = useMemo(
    () =>
      LESSON_MATERIAL_KIND_OPTIONS.map((option) => ({
        ...option,
        label: text.materialTypes[option.value as keyof typeof text.materialTypes] ?? option.label,
      })),
    [text.materialTypes],
  );
  const canSaveMaterial =
    materialDraft.text.trim().length > 0 || materialDraft.files.length > 0;

  const materialFilesSignature = useMemo(
    () =>
      form.materials
        .map(
          (m) =>
            `${m.id}:${m.files.join('|')}:${(m.fileLinks ?? [])
              .map((l) => l.downloadPath ?? '')
              .join('|')}`,
        )
        .join(';'),
    [form.materials],
  );

  useEffect(() => {
    const fromServer = buildMaterialPreviewsFromLesson(form.materials);
    if (Object.values(fromServer).some((row) => row.some((url) => url != null))) {
      setSavedMaterialPreviews(fromServer);
    }
  }, [materialFilesSignature, form.materials]);

  const homeworkFilesSignature = useMemo(
    () =>
      `${form.homeworkFiles.join('|')}:${(form.homeworkFileLinks ?? [])
        .map((link) => link.downloadPath ?? '')
        .join('|')}`,
    [form.homeworkFiles, form.homeworkFileLinks],
  );

  useEffect(() => {
    const fromServer = buildFilePreviewsFromLinks(form.homeworkFiles, form.homeworkFileLinks);
    if (fromServer.some((url) => url != null)) {
      setHomeworkPreviews(fromServer);
    }
  }, [homeworkFilesSignature, form.homeworkFiles, form.homeworkFileLinks]);

  const studentResponseFilesSignature = useMemo(
    () =>
      `${form.studentResponseFiles.join('|')}:${(form.studentResponseFileLinks ?? [])
        .map((link) => link.downloadPath ?? '')
        .join('|')}`,
    [form.studentResponseFiles, form.studentResponseFileLinks],
  );

  useEffect(() => {
    const fromServer = buildFilePreviewsFromLinks(
      form.studentResponseFiles,
      form.studentResponseFileLinks,
    );
    if (fromServer.some((url) => url != null)) {
      setStudentResponsePreviews(fromServer);
    }
  }, [studentResponseFilesSignature, form.studentResponseFiles, form.studentResponseFileLinks]);

  const commitMaterialDraft = useCallback((): LessonFormState => {
    if (!materialDraft.text.trim() && materialDraft.files.length === 0) return form;
    const newMaterialId = `mat-${Date.now()}`;
    movePendingLessonFiles('material', 'draft', 'material', newMaterialId, materialDraft.files);
    const next: LessonFormState = {
      ...form,
      materials: [
        ...form.materials,
        {
          id: newMaterialId,
          kind: materialDraft.kind,
          text: materialDraft.text.trim(),
          files: materialDraft.files,
        },
      ],
    };
    setSavedMaterialPreviews((prev) => ({ ...prev, [newMaterialId]: [...materialDraftPreviews] }));
    setMaterialDraft({ kind: materialDraft.kind, text: '', files: [] });
    setMaterialDraftPreviews([]);
    onChange(next);
    return next;
  }, [form, materialDraft, materialDraftPreviews, onChange]);

  const handleSubmit = useCallback(() => {
    const activeForm = commitMaterialDraft();
    const errors: LessonFieldErrors = {};
    if (!activeForm.title.trim()) errors.title = t('lessonModal.error.titleRequired');
    if (!activeForm.date) errors.date = t('lessonModal.error.dateRequired');
    if (!activeForm.startTime) errors.startTime = t('lessonModal.error.startTimeRequired');
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTab('setup');
      setTimeout(() => {
        const firstErrorField = setupPanelRef.current?.querySelector('[data-field-error]');
        firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setFieldErrors({});
    void onSubmit(activeForm);
  }, [commitMaterialDraft, onSubmit]);

  const lessonPageRouteId =
    lessonBackendId ??
    (persistedLessonId != null ? String(persistedLessonId) : null);
  const showLessonLink = Boolean(lessonPageRouteId);
  const showConfirmButton = role !== USER_ROLE.student.id;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Focus-on-open + Tab trap + focus restore — shared hook (same as MaterialFormModal).
  useFocusTrap(mounted, modalRef);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (imagePreviewUrl) {
          setImagePreviewUrl(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imagePreviewUrl, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-modal-title"
        data-tour-anchor="lesson-modal"
        onClick={e => e.stopPropagation()}
      >
        <LessonModalHeader
          mode={mode}
          role={role}
          text={text}
          canUnlinkSeries={canUnlinkSeries}
          onUnlinkSeries={onUnlinkSeries}
          canDeleteSeries={canDeleteSeries}
          onDeleteSeries={onDeleteSeries}
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
                  <div ref={setupPanelRef} data-tour-anchor="lesson-modal-setup">
                  <LessonSetupTab
                    text={text}
                    canEdit={canEdit}
                    role={role}
                    form={form}
                    students={students}
                    teachers={teachers}
                    weekDayOptions={weekDayOptions}
                    recurrenceAllowed={recurrenceAllowed}
                    fieldErrors={fieldErrors}
                    onChange={(next) => {
                      setFieldErrors({});
                      onChange(next);
                    }}
                  />
                  </div>
                ),
              },
              {
                value: 'content',
                label: text.sections.content,
                panel: (
                  <LessonContentTab
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
                    onStudentResponseFilesSelected={
                      handleStudentResponseFilesSelected
                    }
                    onSaveStudentResponse={onSaveStudentResponse}
                    lessonBackendId={lessonBackendId}
                    studentBackendId={studentBackendId}
                  />
                ),
              },
            ]}
          />
          {fileError ? (
            <div className={styles.fileError} role="alert">{fileError}</div>
          ) : null}
        </div>
        <div
          className={[
            styles.modalActions,
            showLessonLink && showConfirmButton
              ? styles.modalActionsWithLink
              : styles.modalActionsSingle,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.modalActionsHint}>
            {role === USER_ROLE.student.id
              ? t('lessonModal.footer.student')
              : t('lessonModal.footer.staff')}
          </div>
          {showLessonLink ? (
            <Link
              href={`/lessons/${lessonPageRouteId}`}
              className={styles.modalLessonLinkBtn}
              onClick={onClose}
            >
              {t('lessonModal.action.openLessonPage')}
            </Link>
          ) : null}
          {showConfirmButton ? (
            <Button
              type='button'
              className={styles.modalConfirmBtn}
              onClick={handleSubmit}
              disabled={!canEdit || isSaving}
              loading={isSaving}
              loadingLabel={t('lessonModal.action.saving')}
            >
              {mode === 'create'
                ? text.actions.saveLesson
                : text.actions.updateLesson}
            </Button>
          ) : null}
        </div>
      </div>
      <ImagePreviewOverlay
        imagePreviewUrl={imagePreviewUrl}
        text={text}
        onClose={() => setImagePreviewUrl(null)}
      />
    </div>,
    document.body,
  );
}
