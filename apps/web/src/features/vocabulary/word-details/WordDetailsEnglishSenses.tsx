import type { DictionaryPayload } from '../../../lib/word-details-payload';
import { stripHtml } from '../../../lib/strip-html';
import styles from '../word-details-modal.module.scss';

type Props = {
  payload: DictionaryPayload;
};

export function WordDetailsEnglishSenses({ payload }: Props) {
  const meanings = payload.meanings ?? [];
  if (!meanings.length) return null;

  return (
    <div className={styles.sensesWrap}>
      {meanings.map((meaning, mi) => (
        <div key={mi} className={styles.meaningBlock}>
          {meaning.partOfSpeech ? (
            <div className={styles.posLabel}>{meaning.partOfSpeech}</div>
          ) : null}
          <ol className={styles.senseList}>
            {meaning.definitions?.map((def, di) => {
              const senseDef = stripHtml(def.definition ?? '');
              const senseEx = def.example ? stripHtml(def.example) : '';
              if (!senseDef) return null;
              return (
              <li key={di} className={styles.senseItem}>
                <p className={styles.senseDef}>{senseDef}</p>
                {senseEx ? (
                  <p className={styles.example}>&quot;{senseEx}&quot;</p>
                ) : null}
                {(def.synonyms?.length ?? 0) > 0 ? (
                  <p className={styles.senseMeta}>
                    <span className={styles.senseMetaLabel}>Synonyms:</span>{' '}
                    {def.synonyms!.join(', ')}
                  </p>
                ) : null}
                {(def.antonyms?.length ?? 0) > 0 ? (
                  <p className={styles.senseMeta}>
                    <span className={styles.senseMetaLabel}>Antonyms:</span>{' '}
                    {def.antonyms!.join(', ')}
                  </p>
                ) : null}
              </li>
            );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
