'use client';

import { BookMarked, ImageIcon } from 'lucide-react';
import { PROFICIENCY_LEVEL } from '@pkg/types';
import { Button, Field, TagInput } from '../../components/ui';
import uiStyles from '../../components/ui/ui.module.scss';
import {
  isMaterialFileWithinSizeLimit,
  materialFileTooLargeMessage,
} from '../../lib/material-upload-limits';
import styles from './MaterialFormModal.module.scss';

const fieldClass = uiStyles.fieldControl;

interface MaterialDetailsSectionProps {
  level: string;
  publisher: string;
  coverPreviewUrl: string | null;
  coverAttachmentId: string | null;
  pendingCoverFile: File | null;
  tags: string[];
  tagSuggestions: string[];
  isBusy: boolean;
  setLevel: (v: string) => void;
  setPublisher: (v: string) => void;
  setTags: (v: string[]) => void;
  setLocalError: (v: string | null) => void;
  setCoverAttachmentId: (v: string | null) => void;
  setPendingCoverFile: (v: File | null) => void;
  setCoverPreviewUrl: (v: string | null) => void;
  setRemoveCover: (v: boolean) => void;
}

export function MaterialDetailsSection({
  level, publisher, coverPreviewUrl, coverAttachmentId, pendingCoverFile,
  tags, tagSuggestions, isBusy,
  setLevel, setPublisher, setTags, setLocalError,
  setCoverAttachmentId, setPendingCoverFile, setCoverPreviewUrl, setRemoveCover,
}: MaterialDetailsSectionProps) {
  return (
    <section className={styles.formSection} aria-labelledby="material-details-heading">
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon} aria-hidden>
          <BookMarked size={16} />
        </span>
        <div className={styles.sectionHeadText}>
          <h3 id="material-details-heading" className={styles.sectionTitle}>
            Details
          </h3>
          <p className={styles.sectionHint}>Optional — helps teachers filter and find resources faster.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <Field
          as="select"
          className={fieldClass}
          label="Level"
          value={level}
          disabled={isBusy}
          onChange={(event) => setLevel(event.target.value)}
        >
          <option value="">— Not set —</option>
          {(Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]).map((key) => {
            const entry = PROFICIENCY_LEVEL[key];
            return (
              <option key={entry.id} value={entry.code}>
                {entry.code} — {entry.label}
              </option>
            );
          })}
        </Field>
        <Field
          className={fieldClass}
          label="Publisher"
          value={publisher}
          onChange={(event) => setPublisher(event.target.value)}
          placeholder="Oxford, Cambridge…"
          disabled={isBusy}
        />
      </div>

      <div className={styles.coverField}>
        <span className={styles.cellLabel}>
          <ImageIcon size={13} aria-hidden />
          Cover image
        </span>
        <p className={styles.deliveryHint}>
          Optional hero image for library cards. Book PDFs also get title-page previews automatically.
        </p>
        {coverPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreviewUrl} alt="" className={styles.coverPreview} />
        ) : null}
        <Field
          as="file-button"
          className={styles.fileButton}
          buttonLabel={coverPreviewUrl ? 'Replace cover' : 'Choose cover image'}
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={isBusy}
          onFilesSelected={(files) => {
            const file = files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
              setLocalError('Cover must be a JPEG, PNG, or WebP image');
              return;
            }
            if (!isMaterialFileWithinSizeLimit(file.size)) {
              setLocalError(materialFileTooLargeMessage(file.name));
              return;
            }
            setLocalError(null);
            setPendingCoverFile(file);
            setRemoveCover(false);
            setCoverPreviewUrl(URL.createObjectURL(file));
          }}
        />
        {coverPreviewUrl || coverAttachmentId || pendingCoverFile ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isBusy}
            onClick={() => {
              setCoverAttachmentId(null);
              setPendingCoverFile(null);
              setCoverPreviewUrl(null);
              setRemoveCover(true);
            }}
          >
            Remove cover
          </Button>
        ) : null}
      </div>

      <TagInput
        label="Tags"
        value={tags}
        onChange={setTags}
        placeholder="Add tag and press Enter"
        hint="Press Enter or comma. Pick from suggestions below."
        suggestions={tagSuggestions}
        disabled={isBusy}
      />
    </section>
  );
}
