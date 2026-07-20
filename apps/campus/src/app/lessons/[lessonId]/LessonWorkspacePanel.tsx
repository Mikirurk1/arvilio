'use client';

import type React from 'react';
import type { MutableRefObject } from 'react';
import { SurfaceCard } from '../../../components/ui';
import { LessonContentTab } from '../../../features/lesson-modal/LessonContentTab';
import type { MaterialKind, MaterialKindOption } from '../../../features/lesson-modal/tabTypes';
import type { ScheduledLessonDto, UserRoleId } from '@pkg/types';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
import { formatLongDate, formatLessonTime } from './lesson-page-utils';
import styles from './page.module.scss';

type LessonContentText = Parameters<typeof LessonContentTab>[0]['text'];
type MaterialDraft = { kind: MaterialKind; text: string; files: string[] };

interface PreviousLessonContext {
  previousHomeworkText: string;
  previousHomeworkFilesCount: number;
  previousResponseSubmitted: boolean;
  previousVocabularyWords: string[];
  hasPreviousLesson: boolean;
}

interface LessonWorkspacePanelProps {
  draft: ScheduledLessonDto;
  lesson: ScheduledLessonDto;
  canManageLessons: boolean;
  canStudentSubmitHomework: boolean;
  role: UserRoleId;
  text: LessonContentText;
  previous: PreviousLessonContext;
  teacherDisplayName: string;
  studentDisplayName: string;
  lessonStudentBackendId: string | null;
  materialKinds: MaterialKindOption[];
  materialDraft: MaterialDraft;
  setMaterialDraft: (next: MaterialDraft | ((prev: MaterialDraft) => MaterialDraft)) => void;
  materialDraftPreviews: Array<string | null>;
  setMaterialDraftPreviews: (v: Array<string | null> | ((prev: Array<string | null>) => Array<string | null>)) => void;
  savedMaterialPreviews: Record<string, Array<string | null>>;
  setSavedMaterialPreviews: React.Dispatch<React.SetStateAction<Record<string, Array<string | null>>>>;
  homeworkPreviews: Array<string | null>;
  setHomeworkPreviews: (v: Array<string | null> | ((prev: Array<string | null>) => Array<string | null>)) => void;
  studentResponsePreviews: Array<string | null>;
  setStudentResponsePreviews: (v: Array<string | null> | ((prev: Array<string | null>) => Array<string | null>)) => void;
  materialsFileStatus: string | null;
  canSaveMaterial: boolean;
  materialsFileInputRef: MutableRefObject<HTMLInputElement | null>;
  fileError: string | null;
  setImagePreviewUrl: (url: string | null) => void;
  getFilePlaceholder: (fileName: string) => string;
  onUpdate: (next: ScheduledLessonDto) => void;
  onMaterialsFilesSelected: (files: FileList | null) => void;
  onHomeworkFilesSelected: (files: FileList | null) => void;
  onStudentResponseFilesSelected: (files: FileList | null) => void;
  onSaveStudentResponse: () => void;
}

export function LessonWorkspacePanel({
  draft, lesson, canManageLessons, canStudentSubmitHomework, role, text, previous,
  teacherDisplayName, studentDisplayName, lessonStudentBackendId,
  materialKinds, materialDraft, setMaterialDraft, materialDraftPreviews, setMaterialDraftPreviews,
  savedMaterialPreviews, setSavedMaterialPreviews, homeworkPreviews, setHomeworkPreviews,
  studentResponsePreviews, setStudentResponsePreviews, materialsFileStatus, canSaveMaterial,
  materialsFileInputRef, fileError, setImagePreviewUrl, getFilePlaceholder,
  onUpdate, onMaterialsFilesSelected, onHomeworkFilesSelected, onStudentResponseFilesSelected,
  onSaveStudentResponse,
}: LessonWorkspacePanelProps) {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const { previousHomeworkText, previousHomeworkFilesCount, previousResponseSubmitted, previousVocabularyWords, hasPreviousLesson } = previous;

  return (
    <SurfaceCard className={styles.contentCard} padding="none">
      <div className={styles.content}>
        <span className={styles.contentBadge}>{t('lessonDetail.workspace.badge')}</span>
        <p className={styles.contentLead}>
          {canManageLessons
            ? t('lessonDetail.workspace.leadStaff')
            : t('lessonDetail.workspace.leadStudent')}
        </p>

        <section className={styles.workspaceHeroGrid}>
          <article className={styles.workspaceHeroCard}>
            <h3 className={styles.workspaceHeroTitle}>{t('lessonDetail.snapshot')}</h3>
            <div className={styles.workspaceMetaList}>
              <span>{formatLongDate(draft.date, locale)}</span>
              <span>{formatLessonTime(draft.startTime, draft.duration, locale)}</span>
              <span>{teacherDisplayName} · {studentDisplayName}</span>
            </div>
          </article>
          <article className={styles.workspaceHeroCard}>
            <h3 className={styles.workspaceHeroTitle}>{t('lessonDetail.prevContext')}</h3>
            {hasPreviousLesson ? (
              <div className={styles.previousGrid}>
                <article className={styles.previousCard}>
                  <h4 className={styles.previousTitle}>{t('lessonModal.field.homework')}</h4>
                  <p className={styles.previousText}>
                    {previousHomeworkText.length > 0
                      ? previousHomeworkText
                      : t('lessonDetail.prevHomeworkEmpty')}
                  </p>
                  <div className={styles.previousMeta}>
                    <span>
                      {previousResponseSubmitted
                        ? t('lessonDetail.prevResponseSubmitted')
                        : t('lessonDetail.prevResponsePending')}
                    </span>
                    <span>{t('lessonDetail.prevFiles', { count: previousHomeworkFilesCount })}</span>
                  </div>
                </article>
                <article className={styles.previousCard}>
                  <h4 className={styles.previousTitle}>{t('nav.vocabulary')}</h4>
                  {previousVocabularyWords.length > 0 ? (
                    <div className={styles.vocabularyChips}>
                      {previousVocabularyWords.map((word) => (
                        <span key={word} className={styles.vocabularyChip}>{word}</span>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.previousText}>{t('lessonDetail.prevVocabEmpty')}</p>
                  )}
                </article>
              </div>
            ) : (
              <div className={styles.previousEmpty}>{t('lessonDetail.prevEmpty')}</div>
            )}
          </article>
        </section>

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
            kind: draft.kind ?? 'individual',
            participantIds: draft.participantIds ?? [draft.studentId],
            groupBillingMode: draft.groupBilling?.mode ?? 'per_member',
            groupPriceMinor: draft.groupBilling?.priceMinor ?? 0,
            groupCurrency: draft.groupBilling?.currency ?? 'UAH',
            groupSplitMode: draft.groupBilling?.splitMode ?? 'equal_split',
            groupPayerUserId: draft.groupBilling?.payerUserId != null ? Number(draft.groupBilling.payerUserId) : draft.studentId,
            studentGroupId: draft.studentGroupId ?? null,
          }}
          lessonBackendId={lesson.backendId ?? null}
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
            onUpdate({
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
          onMaterialsFilesSelected={onMaterialsFilesSelected}
          onHomeworkFilesSelected={onHomeworkFilesSelected}
          onStudentResponseFilesSelected={onStudentResponseFilesSelected}
          onSaveStudentResponse={onSaveStudentResponse}
          hideStudentSaveButton
        />
        {fileError ? <div className={styles.fileError} role="alert">{fileError}</div> : null}
      </div>
    </SurfaceCard>
  );
}
