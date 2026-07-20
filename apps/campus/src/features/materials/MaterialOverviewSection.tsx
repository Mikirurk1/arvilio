'use client';

import type { LibraryMaterialKindName } from '@pkg/types';
import { Button, Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  titleError?: string;
  onKindChange: (kind: LibraryMaterialKindName) => void;
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
}

export function MaterialOverviewSection({
  kind, title, description, isBusy, titleError, onKindChange, setTitle, setDescription,
}: MaterialOverviewSectionProps) {
  const t = useCampusT();
  const kindLabel = (value: LibraryMaterialKindName) => {
    const key = `materials.kind.${value}` as const;
    return t(key);
  };

  return (
    <section className={styles.formSection} aria-labelledby="material-overview-heading">
      <div className={styles.sectionHead}>
        <span className={styles.sectionIcon} aria-hidden>
          <Sparkles size={16} />
        </span>
        <div className={styles.sectionHeadText}>
          <h3 id="material-overview-heading" className={styles.sectionTitle}>
            {t('materials.form.overviewTitle')}
          </h3>
          <p className={styles.sectionHint}>{t('materials.form.overviewHint')}</p>
        </div>
      </div>

      <div className={styles.kindGrid} role="radiogroup" aria-label={t('materials.form.materialTypeAria')}>
        {LIBRARY_KIND_OPTIONS.map((option) => {
          const active = kind === option.value;
          const OptionIcon = option.Icon;
          return (
            <Button
              key={option.value}
              variant="bare"
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
              <span className={styles.kindOptionLabel}>{kindLabel(option.value)}</span>
              <span className={styles.kindOptionHint}>{option.shortHint}</span>
            </Button>
          );
        })}
      </div>

      <Field
        className={fieldClass}
        label={t('materials.form.titleLabel')}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. B1 Grammar board, Oxford Workbook…"
        disabled={isBusy}
        error={titleError}
        data-field-error={titleError ? 'title' : undefined}
      />

      <Field
        className={fieldClass}
        label={t('materials.form.descriptionLabel')}
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
