'use client';

import { useEffect, useMemo, useState } from 'react';
import { vocabularyStatusLabel, type VocabularyWordStatusName, type WordCardDto } from '@pkg/types';
import { LESSON_STATUS } from '@pkg/types';
import { ClipboardCheck, File, FileText, Image, Info, Monitor, Plus, X } from 'lucide-react';
import { Badge, Button, Field } from '../../components/ui';
import type { LessonFormState } from './types';
import type { LessonModalText, MaterialKind, MaterialKindOption } from './tabTypes';
import { canReviewHomework, type UserRole, USER_ROLE } from '../../mocks';
import { LessonVocabularyAddPanel } from '../vocabulary/LessonVocabularyAddPanel';
import { WordCardAudioButton } from '../vocabulary/WordCardAudioButton';
import { WordDetailsModal } from '../vocabulary/WordDetailsModal';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { pickWordDefinition } from '../../lib/word-definitions';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import vocabStyles from '../../app/vocabulary/page.module.scss';
import {
  lessonFileDisplayName,
  lessonFilePreviewUrl,
} from '../../lib/lesson-file-links';
import { movePendingLessonFiles } from '../../lib/lesson-pending-files';
import { isImageFileName, openLessonAttachment } from './fileUtils';
import { LessonFileChipImage } from './LessonFileChipImage';
import styles from './LessonModal.module.scss';

function fileChipClasses(preview: string | null | undefined, fileName: string): string {
  return [
    styles.fileChip,
    preview && isImageFileName(fileName) ? styles.fileChipImage : '',
    preview ? styles.fileChipClickable : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function fileChipImagePreview(preview: string | null | undefined, fileName: string) {
  if (!preview || !isImageFileName(fileName)) return null;
  return <LessonFileChipImage src={preview} alt={fileName} />;
}

type Props = {
  text: LessonModalText;
  canEdit: boolean;
  role: UserRole;
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
  /** When true, the student inline "Save" is not rendered (e.g. page uses a single save action). */
  hideStudentSaveButton?: boolean;
  /** Backend lesson UUID — links vocabulary cards to this lesson. */
  lessonBackendId?: string | null;
  /** Backend student user UUID for addStudentWordCard. */
  studentBackendId?: string | null;
};

const defaultKinds: MaterialKindOption[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'test', label: 'Test', icon: ClipboardCheck },
  { value: 'file', label: 'File', icon: File },
  { value: 'presentation', label: 'Presentation', icon: Monitor },
];

export function LessonContentTab({
  text,
  canEdit,
  role,
  form,
  materialKinds = defaultKinds,
  materialDraft,
  setMaterialDraft,
  materialDraftPreviews,
  setMaterialDraftPreviews,
  savedMaterialPreviews,
  setSavedMaterialPreviews,
  homeworkPreviews,
  setHomeworkPreviews,
  studentResponsePreviews,
  setStudentResponsePreviews,
  materialsFileStatus,
  canSaveMaterial,
  materialsFileInputRef,
  getFilePlaceholder,
  setImagePreviewUrl,
  onChange,
  onMaterialsFilesSelected,
  onHomeworkFilesSelected,
  onStudentResponseFilesSelected,
  onSaveStudentResponse,
  hideStudentSaveButton = false,
  lessonBackendId = null,
  studentBackendId = null,
}: Props) {
  const canStudentSubmitResponse =
    role === USER_ROLE.student.id &&
    form.statusId === LESSON_STATUS.completed.id;
  const canEditStudentResponse = canEdit || canStudentSubmitResponse;
  const studentStatusPlaceholder =
    role === USER_ROLE.student.id && !canStudentSubmitResponse;
  const canSaveStudentResponse =
    form.studentResponseText.trim().length > 0 || form.studentResponseFiles.length > 0;
  const canEditMaterials = canEdit && role !== USER_ROLE.student.id;
  const canEditHomework = canEdit && role !== USER_ROLE.student.id;
  const canViewLessonVocabulary =
    canEditHomework || (role === USER_ROLE.student.id && Boolean(lessonBackendId));
  const canAddLessonVocabulary = canViewLessonVocabulary && Boolean(studentBackendId);
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
      if (card.lessonId === lessonBackendId) {
        map.set(card.word.id, card.status);
      }
    }
    return map;
  }, [studentCards, lessonBackendId]);

  useEffect(() => {
    if (!studentBackendId) return;
    void fetchCards(
      role === USER_ROLE.student.id ? undefined : studentBackendId,
      true,
    );
  }, [studentBackendId, fetchCards, role]);

  useEffect(() => {
    const ids = form.linkedWordIds;
    if (ids.length === 0) {
      setLinkedWords([]);
      return;
    }
    let cancelled = false;
    void fetchWordsByIds(ids).then((words) => {
      if (!cancelled) setLinkedWords(words);
    });
    return () => {
      cancelled = true;
    };
  }, [form.linkedWordIds, fetchWordsByIds]);

  const removeLinkedWord = (wordId: string) => {
    onChange({
      ...form,
      linkedWordIds: form.linkedWordIds.filter((id) => id !== wordId),
    });
  };

  return (
    <div className={styles.modalContentLayout}>
      <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.lessonPlanCard}`}>
        <label className={styles.fieldLabel}>{text.fields.lessonPlan}</label>
        <Field
          as="textarea"
          className={styles.fieldInput}
          rows={4}
          value={form.lessonPlan}
          readOnly={!canEdit}
          onChange={(e) => onChange({ ...form, lessonPlan: e.target.value })}
        />
      </div>
      <div className={styles.modalContentColumns}>
        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.materialsCard}`}>
          <div className={styles.materialsHeader}>
            <label className={styles.fieldLabel}>{text.fields.materials}</label>
            {role !== USER_ROLE.student.id ? <div className={styles.materialsHint}>{text.materialsHint}</div> : null}
          </div>
          {canEditMaterials ? (
            <>
              <div className={styles.materialTypeRow}>
                {materialKinds.map((kind) => {
                  const Icon = kind.icon;
                  const isActive = materialDraft.kind === kind.value;
                  return (
                    <Button
                      key={kind.value}
                      type="button"
                      className={`${styles.materialTypeBtn} ${isActive ? styles.materialTypeBtnActive : ''}`}
                      disabled={!canEditMaterials}
                      onClick={() => setMaterialDraft((prev) => ({ ...prev, kind: kind.value }))}
                    >
                      <Icon size={14} />
                      <span>{kind.label}</span>
                    </Button>
                  );
                })}
              </div>
              <div className={styles.materialEditorCard}>
                <Field
                  as="textarea"
                  className={styles.fieldInput}
                  rows={3}
                  placeholder={text.placeholders.addText}
                  value={materialDraft.text}
                  readOnly={!canEditMaterials}
                  onChange={(e) => setMaterialDraft((prev) => ({ ...prev, text: e.target.value }))}
                />
                <Field
                  type="file"
                  multiple
                  ref={materialsFileInputRef}
                  style={{ display: 'none' }}
                  disabled={!canEditMaterials}
                  onChange={(e) => {
                    onMaterialsFilesSelected(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
                {materialsFileStatus ? <div className={styles.materialsFileStatus}>{materialsFileStatus}</div> : null}
                {materialDraft.files.length > 0 ? (
                  <div className={styles.fileGrid}>
                    {materialDraft.files.map((fileName, fileIndex) => {
                      const preview = materialDraftPreviews[fileIndex];
                      return (
                      <div
                        key={`draft-${fileName}-${fileIndex}`}
                        className={fileChipClasses(preview, fileName)}
                        role={preview ? 'button' : undefined}
                        tabIndex={preview ? 0 : -1}
                        onClick={() => openLessonAttachment(fileName, preview, setImagePreviewUrl)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          openLessonAttachment(fileName, preview, setImagePreviewUrl);
                        }}
                      >
                        {fileChipImagePreview(preview, fileName)}
                        <Button
                          type="button"
                          className={styles.fileChipRemove}
                          aria-label={text.aria.removeFile}
                          onClick={(event) => {
                            event.stopPropagation();
                            setMaterialDraft((prev) => ({ ...prev, files: prev.files.filter((_, idx) => idx !== fileIndex) }));
                            setMaterialDraftPreviews((prev) => prev.filter((_, idx) => idx !== fileIndex));
                          }}
                        >
                          <X size={12} />
                        </Button>
                        <span>{fileName}</span>
                        {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(fileName)}</em> : null}
                      </div>
                      );
                    })}
                  </div>
                ) : null}
                <div className={styles.materialActionsRow}>
                  <Button
                    type="button"
                    className={styles.fileButton}
                    disabled={!canEditMaterials}
                    onClick={() => materialsFileInputRef.current?.click()}
                  >
                    <Plus size={14} />
                    <span>{text.actions.addFile}</span>
                  </Button>
                  <Button
                    type="button"
                    className={styles.saveMaterialBtn}
                    disabled={!canEditMaterials || !canSaveMaterial}
                    onClick={() => {
                      if (!canSaveMaterial) return;
                      const newMaterialId = `mat-${Date.now()}`;
                      movePendingLessonFiles(
                        'material',
                        'draft',
                        'material',
                        newMaterialId,
                        materialDraft.files,
                      );
                      onChange({
                        ...form,
                        materials: [
                          ...form.materials,
                          { id: newMaterialId, kind: materialDraft.kind, text: materialDraft.text.trim(), files: materialDraft.files },
                        ],
                      });
                      setSavedMaterialPreviews((prev) => ({ ...prev, [newMaterialId]: materialDraftPreviews }));
                      setMaterialDraft({ kind: materialDraft.kind, text: '', files: [] });
                      setMaterialDraftPreviews([]);
                    }}
                  >
                    <span>{text.actions.saveMaterial}</span>
                  </Button>
                </div>
              </div>
            </>
          ) : null}
          {form.materials.length === 0 ? (
            <div className={styles.materialsEmpty}>{text.noMaterials}</div>
          ) : (
            <div className={styles.savedMaterialsList}>
              {form.materials.map((material) => {
                const kindMeta = materialKinds.find((kind) => kind.value === material.kind);
                const KindIcon = kindMeta?.icon ?? FileText;
                return (
                  <div key={material.id} className={styles.savedMaterialItem}>
                    <div className={styles.savedMaterialMeta}>
                      <KindIcon size={14} />
                      <strong>{kindMeta?.label ?? text.fallbackMaterialLabel}</strong>
                    </div>
                    {canEditMaterials ? (
                      <Button
                        type="button"
                        aria-label={text.aria.removeMaterial}
                        className={styles.materialRemoveBtn}
                        onClick={() => {
                          onChange({ ...form, materials: form.materials.filter((item) => item.id !== material.id) });
                          setSavedMaterialPreviews((prev) => {
                            const next = { ...prev };
                            delete next[material.id];
                            return next;
                          });
                        }}
                      >
                        <X size={14} />
                      </Button>
                    ) : null}
                    {material.text ? <div className={styles.savedMaterialText}>{material.text}</div> : null}
                    {material.files.length > 0 ? (
                      <div className={styles.fileGrid}>
                        {material.files.map((fileRef, fileIndex) => {
                          const displayName = lessonFileDisplayName(
                            fileRef,
                            material.fileLinks,
                            fileIndex,
                          );
                          const preview =
                            savedMaterialPreviews[material.id]?.[fileIndex] ??
                            lessonFilePreviewUrl(fileRef, material.fileLinks, fileIndex);
                          return (
                          <div
                            key={`${material.id}-${fileRef}-${fileIndex}`}
                            className={fileChipClasses(preview, displayName)}
                            role={preview ? 'button' : undefined}
                            tabIndex={preview ? 0 : -1}
                            onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter' && event.key !== ' ') return;
                              openLessonAttachment(displayName, preview, setImagePreviewUrl);
                            }}
                          >
                            {fileChipImagePreview(preview, displayName)}
                            <span>{displayName}</span>
                            {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(displayName)}</em> : null}
                          </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.homeworkCard}`}>
        <label className={styles.fieldLabel}>{text.fields.homework}</label>
        <Field as="textarea" className={styles.fieldInput} rows={4} value={form.homeworkText} readOnly={!canEditHomework} onChange={(e) => onChange({ ...form, homeworkText: e.target.value })} />
        {canEditHomework ? (
          <Field as="file-button" className={styles.fileButton} buttonLabel={text.actions.addFile} multiple disabled={!canEditHomework} onFilesSelected={onHomeworkFilesSelected} />
        ) : null}
        {form.homeworkFiles.length > 0 ? (
          <div className={styles.fileGrid}>
            {form.homeworkFiles.map((fileRef, fileIndex) => {
              const displayName = lessonFileDisplayName(
                fileRef,
                form.homeworkFileLinks,
                fileIndex,
              );
              const preview =
                homeworkPreviews[fileIndex] ??
                lessonFilePreviewUrl(fileRef, form.homeworkFileLinks, fileIndex);
              return (
              <div
                key={`hw-${fileRef}-${fileIndex}`}
                className={fileChipClasses(preview, displayName)}
                role={preview ? 'button' : undefined}
                tabIndex={preview ? 0 : -1}
                onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  openLessonAttachment(displayName, preview, setImagePreviewUrl);
                }}
              >
                {fileChipImagePreview(preview, displayName)}
                <Button
                  type="button"
                  className={styles.fileChipRemove}
                  aria-label={text.aria.removeFile}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({ ...form, homeworkFiles: form.homeworkFiles.filter((_, idx) => idx !== fileIndex) });
                    setHomeworkPreviews((prev) => prev.filter((_, idx) => idx !== fileIndex));
                  }}
                >
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
      {canViewLessonVocabulary ? (
        <div
          className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.lessonVocabCard}`}
        >
          <label className={styles.fieldLabel}>Lesson vocabulary</label>
          {linkedWords.length > 0 ? (
            <div className={styles.lessonVocabWordGrid}>
              <div className={`${vocabStyles.wordGrid} ${styles.lessonVocabWordGridList}`}>
                {linkedWords.map((w, i) => {
                  const status: VocabularyWordStatusName =
                    cardStatusByWordId.get(w.id) ?? 'new';
                  const statusTone =
                    status === 'new'
                      ? 'blue'
                      : status === 'repeated'
                        ? 'amber'
                        : status === 'mistakes_work'
                          ? 'rose'
                          : 'green';
                  return (
                    <div
                      key={w.id}
                      className={vocabStyles.wordCard}
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      <div className={vocabStyles.wcTop}>
                        <div>
                          <div className={vocabStyles.wcWord}>{w.text}</div>
                          <div className={vocabStyles.wcPhoneticRow}>
                            {w.phonetic ? (
                              <div className={vocabStyles.wcPhonetic}>{w.phonetic}</div>
                            ) : null}
                            <WordCardAudioButton
                              audioUrl={w.audioUrl}
                              className={vocabStyles.wcAudioBtn}
                            />
                          </div>
                        </div>
                        <div className={vocabStyles.wcTopActions}>
                          <Button
                            type="button"
                            variant="ghost"
                            className={vocabStyles.wcDetailsBtn}
                            onClick={() => setDetailsWordId(w.id)}
                            aria-label="All information"
                            title="All information"
                          >
                            <Info size={16} aria-hidden />
                          </Button>
                          <Badge
                            className={`${vocabStyles.wcStatus} ${vocabStyles[statusTone]}`}
                            variant={statusTone}
                          >
                            {vocabularyStatusLabel(status)}
                          </Badge>
                        </div>
                      </div>
                      <div className={vocabStyles.wcPos}>{w.partOfSpeech ?? '—'}</div>
                      {w.origin ? <div className={vocabStyles.wcOrigin}>{w.origin}</div> : null}
                      <div className={vocabStyles.wcDef}>
                        {pickWordDefinition(
                          w.definitions,
                          nativeLanguageId,
                          englishLanguageId,
                          w.definition,
                        )}
                      </div>
                      {w.example ? (
                        <div className={vocabStyles.wcExample}>&quot;{w.example}&quot;</div>
                      ) : null}
                      {canEditHomework ? (
                        <Button
                          type="button"
                          className={styles.lessonVocabAddBtn}
                          onClick={() => removeLinkedWord(w.id)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <LessonVocabularyAddPanel
            linkedWordIds={form.linkedWordIds}
            studentBackendId={studentBackendId}
            lessonBackendId={lessonBackendId}
            disabled={!canAddLessonVocabulary}
            onAddWordId={(wordId) =>
              onChange({
                ...form,
                linkedWordIds: form.linkedWordIds.includes(wordId)
                  ? form.linkedWordIds
                  : [...form.linkedWordIds, wordId],
              })
            }
          />
        </div>
      ) : null}
      <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.studentResponseCard}`}>
        <label className={styles.fieldLabel}>{text.fields.studentResponse}</label>
        {studentStatusPlaceholder ? (
          <Field
            readOnly
            className={styles.fieldInput}
            value=""
            formatValue={() =>
              form.statusId === LESSON_STATUS.cancelled.id
                ? '—'
                : 'Opens after the lesson is completed'
            }
          />
        ) : (
          <Field as="select"
            className={styles.fieldInput}
            value={form.studentResponseStatus}
            readOnly={!canEditStudentResponse}
            onChange={(e) =>
              onChange({
                ...form,
                studentResponseStatus: e.target.value as typeof form.studentResponseStatus,
              })
            }
          >
            <option value="not_submitted">Not submitted</option>
            <option value="submitted">Submitted</option>
            <option value="needs_rework">Reopen (needs rework)</option>
            <option value="accepted">Accepted</option>
          </Field>
        )}
        <Field as="textarea" className={styles.fieldInput} rows={4} value={form.studentResponseText} readOnly={!canEditStudentResponse} onChange={(e) => onChange({ ...form, studentResponseText: e.target.value })} />
        {role !== USER_ROLE.student.id || canStudentSubmitResponse ? (
          <Field as="file-button" className={styles.fileButton} buttonLabel={text.actions.addFile} multiple disabled={!canEditStudentResponse} onFilesSelected={onStudentResponseFilesSelected} />
        ) : null}
        {form.studentResponseFiles.length > 0 ? (
          <div className={styles.fileGrid}>
            {form.studentResponseFiles.map((fileRef, fileIndex) => {
              const displayName = lessonFileDisplayName(
                fileRef,
                form.studentResponseFileLinks,
                fileIndex,
              );
              const preview =
                studentResponsePreviews[fileIndex] ??
                lessonFilePreviewUrl(fileRef, form.studentResponseFileLinks, fileIndex);
              return (
              <div
                key={`resp-${fileRef}-${fileIndex}`}
                className={fileChipClasses(preview, displayName)}
                role={preview ? 'button' : undefined}
                tabIndex={preview ? 0 : -1}
                onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  openLessonAttachment(displayName, preview, setImagePreviewUrl);
                }}
              >
                {fileChipImagePreview(preview, displayName)}
                <Button
                  type="button"
                  className={styles.fileChipRemove}
                  aria-label={text.aria.removeFile}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({ ...form, studentResponseFiles: form.studentResponseFiles.filter((_, idx) => idx !== fileIndex) });
                    setStudentResponsePreviews((prev) => prev.filter((_, idx) => idx !== fileIndex));
                  }}
                >
                  <X size={12} />
                </Button>
                <span>{displayName}</span>
                {!preview ? <em className={styles.fileChipType}>{getFilePlaceholder(displayName)}</em> : null}
              </div>
              );
            })}
          </div>
        ) : null}
        {showHomeworkReviewBlock ? (
          <div className={styles.homeworkReviewBlock}>
            <div className={styles.homeworkReviewHeading}>{text.fields.homeworkReview}</div>
            {canReview && !form.homeworkChecked ? (
              <Button
                type="button"
                className={styles.markHomeworkCheckedBtn}
                onClick={() => onChange({ ...form, homeworkChecked: true })}
              >
                {text.actions.markHomeworkChecked}
              </Button>
            ) : null}
            {form.homeworkChecked ? (
              <>
                <div className={styles.homeworkCheckedRow}>
                  <span className={styles.homeworkCheckedBadge}>{text.homeworkCheckedStatus}</span>
                </div>
                <label className={styles.fieldLabel}>{text.fields.teacherHomeworkFeedback}</label>
                <Field
                  as="textarea"
                  className={styles.fieldInput}
                  rows={4}
                  value={form.teacherHomeworkFeedback}
                  readOnly={!canReview}
                  onChange={(e) =>
                    onChange({ ...form, teacherHomeworkFeedback: e.target.value })
                  }
                />
              </>
            ) : null}
          </div>
        ) : null}
        {role === USER_ROLE.student.id && canStudentSubmitResponse && !hideStudentSaveButton ? (
          <Button
            type="button"
            className={styles.saveMaterialBtn}
            disabled={!canSaveStudentResponse}
            onClick={onSaveStudentResponse}
          >
            Save
          </Button>
        ) : null}
      </div>
      {detailsWordId ? (
        <WordDetailsModal wordId={detailsWordId} onClose={() => setDetailsWordId(null)} />
      ) : null}
    </div>
  );
}
