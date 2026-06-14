'use client';

import { X } from 'lucide-react';
import { Button, Field } from '../../../components/ui';
import { LESSON_STATUS } from '@pkg/types';
import type { LessonFormState } from '../types';
import type { LessonModalText } from '../tabTypes';
import { USER_ROLE, type UserRole } from '../../../mocks';
import { lessonFileDisplayName, lessonFilePreviewUrl } from '../../../lib/lesson-file-links';
import { openLessonAttachment } from '../fileUtils';
import { fileChipClasses, fileChipImagePreview } from './lesson-file-chip-utils';
import styles from '../LessonModal.module.scss';

interface Props {
  form: LessonFormState;
  onChange: (next: LessonFormState) => void;
  role: UserRole;
  studentResponsePreviews: Array<string | null>;
  setStudentResponsePreviews: React.Dispatch<React.SetStateAction<Array<string | null>>>;
  canEditStudentResponse: boolean;
  canStudentSubmitResponse: boolean;
  studentStatusPlaceholder: boolean;
  canReview: boolean;
  showHomeworkReviewBlock: boolean;
  canSaveStudentResponse: boolean;
  hideStudentSaveButton: boolean;
  getFilePlaceholder: (fileName: string) => string;
  setImagePreviewUrl: (url: string | null) => void;
  onStudentResponseFilesSelected: (files: FileList | null) => void;
  onSaveStudentResponse: () => void;
  text: LessonModalText;
}

export function LessonStudentResponseSection({
  form, onChange, role,
  studentResponsePreviews, setStudentResponsePreviews,
  canEditStudentResponse, canStudentSubmitResponse, studentStatusPlaceholder,
  canReview, showHomeworkReviewBlock, canSaveStudentResponse, hideStudentSaveButton,
  getFilePlaceholder, setImagePreviewUrl, onStudentResponseFilesSelected, onSaveStudentResponse,
  text,
}: Props) {
  return (
    <div className={`${styles.fieldGroup} ${styles.fieldGroupFull} ${styles.modalSectionCard} ${styles.studentResponseCard}`}>
      <label className={styles.fieldLabel}>{text.fields.studentResponse}</label>
      <p className={styles.sectionHint}>Track submission state and feedback in one place so review flow stays predictable.</p>
      {studentStatusPlaceholder ? (
        <Field readOnly className={styles.fieldInput} value="" formatValue={() => form.statusId === LESSON_STATUS.cancelled.id ? '—' : 'Opens after the lesson is completed'} />
      ) : (
        <Field as="select" className={styles.fieldInput} value={form.studentResponseStatus} readOnly={!canEditStudentResponse} onChange={(e) => onChange({ ...form, studentResponseStatus: e.target.value as typeof form.studentResponseStatus })}>
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
            const displayName = lessonFileDisplayName(fileRef, form.studentResponseFileLinks, fileIndex);
            const preview = studentResponsePreviews[fileIndex] ?? lessonFilePreviewUrl(fileRef, form.studentResponseFileLinks, fileIndex);
            return (
              <div key={`resp-${fileRef}-${fileIndex}`} className={fileChipClasses(preview, displayName)} role={preview ? 'button' : undefined} tabIndex={preview ? 0 : -1}
                onClick={() => openLessonAttachment(displayName, preview, setImagePreviewUrl)}
                onKeyDown={(event) => { if (event.key !== 'Enter' && event.key !== ' ') return; openLessonAttachment(displayName, preview, setImagePreviewUrl); }}>
                {fileChipImagePreview(preview, displayName)}
                <Button type="button" className={styles.fileChipRemove} aria-label={text.aria.removeFile}
                  onClick={(event) => { event.stopPropagation(); onChange({ ...form, studentResponseFiles: form.studentResponseFiles.filter((_, idx) => idx !== fileIndex) }); setStudentResponsePreviews((prev) => prev.filter((_, idx) => idx !== fileIndex)); }}>
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
            <Button type="button" className={styles.markHomeworkCheckedBtn} onClick={() => onChange({ ...form, homeworkChecked: true })}>
              {text.actions.markHomeworkChecked}
            </Button>
          ) : null}
          {form.homeworkChecked ? (
            <>
              <div className={styles.homeworkCheckedRow}>
                <span className={styles.homeworkCheckedBadge}>{text.homeworkCheckedStatus}</span>
              </div>
              <label className={styles.fieldLabel}>{text.fields.teacherHomeworkFeedback}</label>
              <Field as="textarea" className={styles.fieldInput} rows={4} value={form.teacherHomeworkFeedback} readOnly={!canReview} onChange={(e) => onChange({ ...form, teacherHomeworkFeedback: e.target.value })} />
            </>
          ) : null}
        </div>
      ) : null}
      {role === USER_ROLE.student.id && canStudentSubmitResponse && !hideStudentSaveButton ? (
        <Button type="button" className={styles.saveMaterialBtn} disabled={!canSaveStudentResponse} onClick={onSaveStudentResponse}>Save</Button>
      ) : null}
    </div>
  );
}
