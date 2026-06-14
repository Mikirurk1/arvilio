'use client';

import { useMemo } from 'react';
import type { WordDetailsDto } from '@pkg/types';
import { resolveWordEnrichmentProvenance } from '@pkg/types';
import { BookOpen, Info, Languages, Layers3, Sparkles } from 'lucide-react';
import styles from '../word-details-modal.module.scss';

type Props = {
  details: WordDetailsDto;
};

function SourceChip({ children }: { children: string }) {
  return <span className={styles.provenanceChip}>{children}</span>;
}

export function WordDetailsProvenance({ details }: Props) {
  const provenance = useMemo(
    () => resolveWordEnrichmentProvenance(details.source, details.sourcePayloadJson),
    [details.source, details.sourcePayloadJson],
  );

  const hasDictionary = Boolean(provenance.dictionaryLabel);
  const hasSupplemental = provenance.supplementalLabels.length > 0;
  const hasTranslation = provenance.translationLabels.length > 0;

  if (!hasDictionary && !hasSupplemental && !hasTranslation && !provenance.translationUnknown) {
    return null;
  }

  return (
    <section className={styles.provenance} aria-label="Word data sources">
      <div className={styles.provenanceHeader}>
        <span className={styles.provenanceHeaderIcon} aria-hidden>
          <Sparkles size={14} />
        </span>
        <div className={styles.provenanceHeaderText}>
          <h3 className={styles.provenanceTitle}>Data sources</h3>
          <p className={styles.provenanceSubtitle}>How this entry was looked up and translated</p>
        </div>
      </div>

      <div className={styles.provenanceCard}>
        <ul className={styles.provenanceList}>
          {hasDictionary ? (
            <li className={styles.provenanceItem}>
              <span className={styles.provenanceItemIcon} aria-hidden>
                <BookOpen size={15} />
              </span>
              <div className={styles.provenanceItemBody}>
                <span className={styles.provenanceItemLabel}>Dictionary</span>
                <div className={styles.provenanceChips}>
                  <SourceChip>{provenance.dictionaryLabel!}</SourceChip>
                </div>
              </div>
            </li>
          ) : null}

          {hasSupplemental ? (
            <li className={styles.provenanceItem}>
              <span className={styles.provenanceItemIcon} aria-hidden>
                <Layers3 size={15} />
              </span>
              <div className={styles.provenanceItemBody}>
                <span className={styles.provenanceItemLabel}>Related words</span>
                <p className={styles.provenanceItemHint}>
                  Extra API for synonyms, antonyms, and phrase glosses alongside the main dictionary.
                </p>
                <div className={styles.provenanceChips}>
                  {provenance.supplementalLabels.map((label) => (
                    <SourceChip key={label}>{label}</SourceChip>
                  ))}
                </div>
              </div>
            </li>
          ) : null}

          <li className={styles.provenanceItem}>
            <span className={styles.provenanceItemIcon} aria-hidden>
              <Languages size={15} />
            </span>
            <div className={styles.provenanceItemBody}>
              <span className={styles.provenanceItemLabel}>Translation</span>
              {hasTranslation ? (
                <div className={styles.provenanceChips}>
                  {provenance.translationLabels.map((label) => (
                    <SourceChip key={label}>{label}</SourceChip>
                  ))}
                </div>
              ) : (
                <p className={styles.provenanceNote}>
                  <Info size={14} aria-hidden />
                  <span>Not stored for this entry yet. Updates on the next enrichment.</span>
                </p>
              )}
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
