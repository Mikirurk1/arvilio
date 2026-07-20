'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { type VocabularyWordStatusName, type WordCardDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { X } from 'lucide-react';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import type { LessonFormState } from './types';
import type { LessonModalText, MaterialKind, MaterialKindOption } from './tabTypes';
import { LESSON_MATERIAL_KIND_OPTIONS } from './lesson-material-kinds';
import { canReviewHomework } from '../../lib/roles';
import { USER_ROLE, type UserRoleId } from '@pkg/types';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { lessonFileDisplayName, lessonFilePreviewUrl } from '../../lib/lesson-file-links';
import { openLessonAttachment } from './fileUtils';
import { fileChipClasses, fileChipImagePreview } from './lesson-content-tab/lesson-file-chip-utils';
import { LessonMaterialsSection } from './lesson-content-tab/LessonMaterialsSection';
import { LessonVocabularySection } from './lesson-content-tab/LessonVocabularySection';
import { LessonStudentResponseSection } from './lesson-content-tab/LessonStudentResponseSection';
import styles from './LessonModal.module.scss';

type Props = {
  text: LessonModalText;
  canEdit: boolean;
  role: UserRoleId;
  form: LessonFormState;
  materialKinds: MaterialKindOption[];
  materialDraft: { kind: MaterialKind; text: string; files: string[] };
  setMaterialDraft: React.Dispatch<React.SetStateAction<{ kind: MaterialKind; text: string; files: string[] }>>;
  materialDraftPreviews: Array<string | null>;
  setMaterialDraftPreviews: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  savedMaterialPreviews: Record<string, Array<string | null>>;
  setSavedMaterialPreviews: React.Dispatch<React.SetStateAction<Record<string, Array<string | null>>>>;
  homeworkPreviews: Array<string | null>;
  setHomeworkPreviews: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  studentResponsePreviews: Array<string | null>;
  setStudentResponsePreviews: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  materialsFileStatus: string | null;
  canSaveMaterial: boolean;
  materialsFileInputRef: React.RefObject<HTMLInputElement | null>;
  getFilePlaceholder: (fileName: string) => string;
  setImagePreviewUrl: (url: string | null) => void;
  onChange: (next: LessonFormState) => void;
  onMaterialsFilesSelected: (files: FileList | null) => void;
  onHomeworkFilesSelected: (files: FileList | null) => void;
  onStudentResponseFilesSelected: (files: FileList | null) => void;
  onSaveStudentResponse: () => void;
  hideStudentSaveButton?: boolean;
  lessonBackendId?: string | null;
  studentBackendId?: string | null;
};

export function LessonContentTab({
  text, canEdit, role, form,
  materialKinds = LESSON_MATERIAL_KIND_OPTIONS,
  materialDraft, setMaterialDraft, materialDraftPreviews, setMaterialDraftPreviews,
  savedMaterialPreviews, setSavedMaterialPreviews,
  homeworkPreviews, setHomeworkPreviews,
  studentResponsePreviews, setStudentResponsePreviews,
  materialsFileStatus, canSaveMaterial, materialsFileInputRef,
  getFilePlaceholder, setImagePreviewUrl, onChange,
  onMaterialsFilesSelected, onHomeworkFilesSelected, onStudentResponseFilesSelected,
  onSaveStudentResponse, hideStudentSaveButton = false,
  lessonBackendId = null, studentBackendId = null,
}: Props) {
  const t = useCampusT();
  const pathname = usePathname();
  const canStudentSubmitResponse = role === USER_ROLE.student.id && form.statusId === LESSON_STATUS.completed.id;
  const canEditStudentResponse = canEdit || canStudentSubmitResponse;
  const studentStatusPlaceholder = role === USER_ROLE.student.id && !canStudentSubmitResponse;
  const canSaveStudentResponse = form.studentResponseText.trim().length > 0 || form.studentResponseFiles.length > 0;
  const canEditMaterials = canEdit && role !== USER_ROLE.student.id;
  const canEditHomework = canEdit && role !== USER_ROLE.student.id;
  const canViewLessonVocabulary = canEditHomework || (role === USER_ROLE.student.id && Boolean(lessonBackendId));
  const canAddLessonVocabulary = canViewLessonVocabulary && Boolean(studentBackendId);
  const libraryAssetAudience = role === USER_ROLE.student.id ? ('student' as const) : ('staff' as const);
  const materialTypeLabels = useMemo(() => ({
    text: text.materialTypes.text, photo: text.materialTypes.photo, file: text.materialTypes.file,
    presentation: text.materialTypes.presentation, book: text.materialTypes.book,
    board: text.materialTypes.board, test: text.materialTypes.test,
  }), [text.materialTypes]);
  const canReview = canReviewHomework(role);
  const showHomeworkReviewBlock = canReview || (role === USER_ROLE.student.id && form.homeworkChecked);

  const fetchWordsByIds = useVocabularyStore((s) => s.fetchWordsByIds);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const studentCards = useVocabularyStore((s) => s.cards.data);
  const [linkedWords, setLinkedWords] = useState<WordCardDto[]>([]);
  const [detailsWordId, setDetailsWordId] = useState<string | null>(null);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();

  const cardStatusByWordId = useMemo(() => {
    const map = new Map<string, VocabularyWordStatusName>();
    if (!studentCards || !lessonBackendId) return map;
    for (const card of studentCards) {
      if (card.lessonId === lessonBackendId) map.set(card.word.id, card.status);
    }
    return map;
  }, [studentCards, lessonBackendId]);

  useEffect(() => {
    if (!studentBackendId) return;
    void fetchCards(role === USER_ROLE.student.id ? undefined : studentBackendId, true);
  }, [studentBackendId, fetchCards, role]);

  useEffect(() => {
    const ids = form.linkedWordIds;
    if (ids.length === 0) { setLinkedWords([]); return; }
    let cancelled = false;
    void fetchWordsByIds(ids).then((words) => { if (!cancelled) setLinkedWords(words); });
    return () => { cancelled = true; };
  }, [form.linkedWordIds, fetchWordsByIds]);

  return (
    <div className={styles.modalContentLayout}>
      <div
        className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.lessonPlanCard}`}
        data-tour-anchor="lesson-plan"
      >
        <label className={styles.fieldLabel}>{text.fields.lessonPlan}</label>
        <p className={styles.sectionHint}>{t('lessonModal.hint.lessonPlan')}</p>
        <Field as="textarea" className={styles.fieldInput} rows={4} value={form.lessonPlan} readOnly={!canEdit} onChange={(e) => onChange({ ...form, lessonPlan: e.target.value })} />
      </div>
      <div className={styles.modalContentColumns}>
        <LessonMaterialsSection
          form={form} onChange={onChange} role={role}
          materialKinds={materialKinds} materialTypeLabels={materialTypeLabels}
          materialDraft={materialDraft} setMaterialDraft={setMaterialDraft}
          materialDraftPreviews={materialDraftPreviews} setMaterialDraftPreviews={setMaterialDraftPreviews}
          savedMaterialPreviews={savedMaterialPreviews} setSavedMaterialPreviews={setSavedMaterialPreviews}
          materialsFileStatus={materialsFileStatus} canSaveMaterial={canSaveMaterial}
          canEditMaterials={canEditMaterials} materialsFileInputRef={materialsFileInputRef}
          getFilePlaceholder={getFilePlaceholder} setImagePreviewUrl={setImagePreviewUrl}
          onMaterialsFilesSelected={onMaterialsFilesSelected}
          libraryAssetAudience={libraryAssetAudience} studentBackendId={studentBackendId}
          pathname={pathname} text={text}
        />
        <div
          className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.homeworkCard}`}
          data-tour-anchor="lesson-homework"
        >
          <label className={styles.fieldLabel}>{text.fields.homework}</label>
          <p className={styles.sectionHint}>{t('lessonModal.hint.homework')}</p>
          <Field as="textarea" className={styles.fieldInput} rows={4} value={form.homeworkText} readOnly={!canEditHomework} onChange={(e) => onChange({ ...form, homeworkText: e.target.value })} />
          {canEditHomework ? (
            <Field as="file-button" className={styles.fileButton} buttonLabel={text.actions.addFile} multiple disabled={!canEditHomework} onFilesSelected={onHomeworkFilesSelected} />
          ) : null}
          {form.homeworkFiles.length > 0 ? (
            <div className={styles.fileGrid}>
              {form.homeworkFiles.map((fileRef, fileIndex) => {
                const displayName = lessonFileDisplayName(fileRef, form.homeworkFileLinks, fileIndex);
                const preview = homeworkPreviews[fileIndex] ?? lessonFilePreviewUrl(fileRef, form.homeworkFileLinks, fileIndex);
                return (
                  <div key={`hw-${fileRef}-${fileIndex}`} className={fileChipClasses(preview, displayName)} role={preview ? 'button' : undefined} tabIndex={preview ? 0 : -1}
                    onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                    onKeyDown={(event) => { if (event.key !== 'Enter' && event.key !== ' ') return; openLessonAttachment(displayName, preview, setImagePreviewUrl); }}>
                    {fileChipImagePreview(preview, displayName)}
                    <Button type="button" className={styles.fileChipRemove} aria-label={text.aria.removeFile}
                      onClick={(event) => { event.stopPropagation(); onChange({ ...form, homeworkFiles: form.homeworkFiles.filter((_, idx) => idx !== fileIndex) }); setHomeworkPreviews((prev) => prev.filter((_, idx) => idx !== fileIndex)); }}>
                      <X size={12} />
                    </Button>
                    <span>{displayName}</span>
                    {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(displayName)}</em> : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <LessonVocabularySection
        form={form} onChange={onChange}
        linkedWords={linkedWords} cardStatusByWordId={cardStatusByWordId}
        canViewLessonVocabulary={canViewLessonVocabulary} canAddLessonVocabulary={canAddLessonVocabulary}
        canEditHomework={canEditHomework} studentBackendId={studentBackendId}
        lessonBackendId={lessonBackendId} nativeLanguageId={nativeLanguageId} englishLanguageId={englishLanguageId}
        detailsWordId={detailsWordId} setDetailsWordId={setDetailsWordId}
      />
      <LessonStudentResponseSection
        form={form} onChange={onChange} role={role}
        studentResponsePreviews={studentResponsePreviews} setStudentResponsePreviews={setStudentResponsePreviews}
        canEditStudentResponse={canEditStudentResponse} canStudentSubmitResponse={canStudentSubmitResponse}
        studentStatusPlaceholder={studentStatusPlaceholder} canReview={canReview}
        showHomeworkReviewBlock={showHomeworkReviewBlock} canSaveStudentResponse={canSaveStudentResponse}
        hideStudentSaveButton={hideStudentSaveButton} getFilePlaceholder={getFilePlaceholder}
        setImagePreviewUrl={setImagePreviewUrl} onStudentResponseFilesSelected={onStudentResponseFilesSelected}
        onSaveStudentResponse={onSaveStudentResponse} text={text}
      />
    </div>
  );
}
