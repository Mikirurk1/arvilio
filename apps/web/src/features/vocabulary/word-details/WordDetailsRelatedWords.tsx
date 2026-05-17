import styles from '../word-details-modal.module.scss';

type Props = {
  synonyms: string[];
  antonyms: string[];
};

export function WordDetailsRelatedWords({ synonyms, antonyms }: Props) {
  if (!synonyms.length && !antonyms.length) return null;

  return (
    <div className={styles.relatedWrap}>
      {synonyms.length > 0 ? (
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>Synonyms</span>
          <div className={styles.chipRow}>
            {synonyms.map((word) => (
              <span key={word} className={styles.chip}>
                {word}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {antonyms.length > 0 ? (
        <div className={styles.chipGroup}>
          <span className={styles.chipGroupLabel}>Antonyms</span>
          <div className={styles.chipRow}>
            {antonyms.map((word) => (
              <span key={word} className={`${styles.chip} ${styles.chipAntonym}`}>
                {word}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
