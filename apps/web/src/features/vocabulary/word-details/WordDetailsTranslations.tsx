import type { WordDefinitionDto } from '@soenglish/shared-types';
import { isUsableGloss } from '../../../lib/word-definitions';
import styles from '../word-details-modal.module.scss';

type Props = {
  translation: WordDefinitionDto;
};

export function WordDetailsTranslations({ translation }: Props) {
  const hasLemma = isUsableGloss(translation.lemmaText);
  const hasDefinition = isUsableGloss(translation.text);
  const pos = translation.partOfSpeech?.trim();

  return (
    <div className={styles.translationBlock}>
      {pos ? <div className={styles.translationPos}>{pos}</div> : null}
      {hasLemma ? (
        <div className={styles.translationPart}>
          <span className={styles.translationPartLabel}>Word</span>
          <p className={styles.translationLemma}>{translation.lemmaText}</p>
        </div>
      ) : null}
      {hasDefinition ? (
        <div className={styles.translationPart}>
          <span className={styles.translationPartLabel}>Definition</span>
          <p className={styles.translationText}>{translation.text}</p>
        </div>
      ) : null}
    </div>
  );
}
