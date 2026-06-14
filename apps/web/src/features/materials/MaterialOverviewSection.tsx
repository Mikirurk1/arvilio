'use client';

import type { LibraryMaterialKindName } from '@pkg/types';
import { Field } from '../../components/ui';
import uiStyles from '../../components/ui/ui.module.scss';
import { LIBRARY_KIND_OPTIONS } from './material-kind-meta';
import type { MaterialKindTone } from './material-kind-meta';
import { Sparkles } from 'lucide-react';
import styles from './MaterialFormModal.module.scss';

const fieldClass = uiStyles.fieldControl;

const toneClass: Record<MaterialKindTone, string> = {
  board: styles.toneBoard,
  presentation: styles.tonePresentation,
  book: styles.toneBook,
  other: styles.toneOther,
};

interface MaterialOverviewSectionProps {
  kind: LibraryMaterialKindName;
  title: string;
  description: string;
  isBusy: boolean;
  onKindChange: (kind: LibraryMaterialKindName) => void;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
}

export function MaterialOverviewSection({
  kind, title, description, isBusy, onKindChange, setTitle, setDescription,
}: MaterialOverviewSectionProps) {
  return (
    <section className={styles.formSection} aria-labelledby="material-overview-heading">
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon} aria-hidden>
          <Sparkles size={16} />
        </span>
        <div className={styles.sectionHeadText}>
          <h3 id="material-overview-heading" className={styles.sectionTitle}>
            Overview
          </h3>
          <p className={styles.sectionHint}>Choose a type and give the material a clear title.</p>
        </div>
      </div>

      <div className={styles.kindGrid} role="radiogroup" aria-label="Material type">
        {LIBRARY_KIND_OPTIONS.map((option) => {
          const active = kind === option.value;
          const OptionIcon = option.Icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isBusy}
              className={[
                styles.kindOption,
                toneClass[option.tone],
                active ? styles.kindOptionActive : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onKindChange(option.value)}
            >
              <span className={styles.kindOptionIcon}>
                <OptionIcon size={18} aria-hidden />
              </span>
              <span className={styles.kindOptionLabel}>{option.label}</span>
              <span className={styles.kindOptionHint}>{option.shortHint}</span>
            </button>
          );
        })}
      </div>

      <Field
        className={fieldClass}
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. B1 Grammar board, Oxford Workbook…"
        disabled={isBusy}
      />

      <Field
        className={fieldClass}
        label="Description"
        as="textarea"
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="What is this resource for? Who should use it?"
        disabled={isBusy}
      />
    </section>
  );
}
