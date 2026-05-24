'use client';

import { useEffect, useMemo, useState } from 'react';
import type { WordDetailsDto } from '@pkg/types';
import { X } from 'lucide-react';
import { Button } from '../../components/ui';
import { WORD_DETAILS } from '../../graphql/operations';
import { graphqlRequest } from '../../lib/graphql-client';
import {
  collectSynonymsAntonyms,
  getPhonetics,
  parsePayload,
  resolveHeroPartsOfSpeech,
  resolveOrigin,
} from '../../lib/word-details-payload';
import { isUsableGloss, pickNativeDefinitions } from '../../lib/word-definitions';
import { stripHtml } from '../../lib/strip-html';
import { useViewerLanguageIds } from '../../hooks/use-viewer-language-ids';
import { selectLanguagesList, useLanguagesStore } from '../../stores/languages-store';
import { WordCardAudioButton } from './WordCardAudioButton';
import { WordDetailsEnglishSenses } from './word-details/WordDetailsEnglishSenses';
import { WordDetailsHero } from './word-details/WordDetailsHero';
import { WordDetailsRelatedWords } from './word-details/WordDetailsRelatedWords';
import { WordDetailsSection } from './word-details/WordDetailsSection';
import { WordDetailsTranslations } from './word-details/WordDetailsTranslations';
import styles from './word-details-modal.module.scss';

type Props = {
  wordId: string;
  onClose: () => void;
};

export function WordDetailsModal({ wordId, onClose }: Props) {
  const languages = useLanguagesStore(selectLanguagesList);
  const { nativeLanguageId, englishLanguageId } = useViewerLanguageIds();
  const [details, setDetails] = useState<WordDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void graphqlRequest<{ wordDetails: WordDetailsDto }>(WORD_DETAILS, { id: wordId })
      .then((data) => {
        if (!cancelled) setDetails(data.wordDetails);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load word details');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wordId]);

  const payload = useMemo(
    () => (details ? parsePayload(details.sourcePayloadJson) : null),
    [details],
  );

  const phonetics = useMemo(
    () => (details ? getPhonetics(payload, details) : []),
    [details, payload],
  );

  const primaryPhonetic = phonetics[0] ?? null;
  const extraPhonetics = phonetics.length > 1 ? phonetics.slice(1) : [];

  const related = useMemo(
    () => (details ? collectSynonymsAntonyms(details, payload) : { synonyms: [], antonyms: [] }),
    [details, payload],
  );

  const origin = details ? resolveOrigin(details, payload) : null;

  const partsOfSpeech = useMemo(
    () => (details ? resolveHeroPartsOfSpeech(details, payload) : []),
    [details, payload],
  );

  const nativeTranslations = useMemo(() => {
    if (!details?.definitions?.length) return [];
    return pickNativeDefinitions(details.definitions, nativeLanguageId, englishLanguageId);
  }, [details, nativeLanguageId, englishLanguageId]);

  const nativeLanguageName = useMemo(() => {
    if (!nativeLanguageId) return '';
    return languages.find((l) => l.id === nativeLanguageId)?.name ?? '';
  }, [languages, nativeLanguageId]);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-details-title"
      >
        <div className={styles.head}>
          <div className={styles.headText}>
            <h2 id="word-details-title" className={styles.title}>
              {details?.text ?? 'Word details'}
            </h2>
            {partsOfSpeech.length > 0 ? (
              <p className={styles.headSubtitle}>{partsOfSpeech.join(' · ')}</p>
            ) : details?.partOfSpeech ? (
              <p className={styles.headSubtitle}>{details.partOfSpeech}</p>
            ) : null}
          </div>
          <Button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        {loading ? <p className={styles.hint}>Loading…</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        {details && !loading ? (
          <div className={styles.body}>
            <WordDetailsHero
              details={details}
              partsOfSpeech={partsOfSpeech}
              primaryPhonetic={primaryPhonetic}
            />

            {stripHtml(details.definition ?? '') ? (
              <WordDetailsSection
                title="Main definition"
                subtitle="English"
              >
                <p className={styles.primaryDef}>{stripHtml(details.definition ?? '')}</p>
                {details.example && stripHtml(details.example) ? (
                  <p className={styles.primaryExample}>
                    &quot;{stripHtml(details.example)}&quot;
                  </p>
                ) : null}
              </WordDetailsSection>
            ) : null}

            {nativeTranslations.some((t) => isUsableGloss(t.text, t.lemmaText)) ? (
              <WordDetailsSection
                title="Translation"
                subtitle={nativeLanguageName}
              >
                <div className={styles.translationList}>
                  {nativeTranslations.map((row) => (
                    <WordDetailsTranslations
                      key={row.partOfSpeech || 'default'}
                      translation={row}
                    />
                  ))}
                </div>
              </WordDetailsSection>
            ) : null}

            {payload?.meanings?.length ? (
              <WordDetailsSection
                title="Dictionary (English)"
                subtitle="Additional senses from the English dictionary"
              >
                <WordDetailsEnglishSenses payload={payload} />
              </WordDetailsSection>
            ) : null}

            {extraPhonetics.length > 0 ? (
              <WordDetailsSection title="Pronunciation variants">
                <ul className={styles.phoneticList}>
                  {extraPhonetics.map((row, i) => (
                    <li key={i} className={styles.phoneticRow}>
                      {row.text ? <span className={styles.phoneticText}>{row.text}</span> : null}
                      <WordCardAudioButton audioUrl={row.audio} className={styles.audioBtn} />
                    </li>
                  ))}
                </ul>
              </WordDetailsSection>
            ) : null}

            {related.synonyms.length > 0 || related.antonyms.length > 0 ? (
              <WordDetailsSection title="Related words">
                <WordDetailsRelatedWords
                  synonyms={related.synonyms}
                  antonyms={related.antonyms}
                />
              </WordDetailsSection>
            ) : null}

            {origin ? (
              <WordDetailsSection title="Origin">
                <p className={styles.paragraph}>{origin}</p>
              </WordDetailsSection>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
