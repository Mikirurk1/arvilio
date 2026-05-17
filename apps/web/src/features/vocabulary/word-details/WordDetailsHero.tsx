import type { WordDetailsDto } from '@soenglish/shared-types';
import type { PhoneticRow } from '../../../lib/word-details-payload';
import { WordCardAudioButton } from '../WordCardAudioButton';
import styles from '../word-details-modal.module.scss';

type Props = {
  details: WordDetailsDto;
  partsOfSpeech: string[];
  primaryPhonetic: PhoneticRow | null;
};

export function WordDetailsHero({ details, partsOfSpeech, primaryPhonetic }: Props) {
  const badges = partsOfSpeech.length > 0 ? partsOfSpeech : details.partOfSpeech ? [details.partOfSpeech] : [];

  return (
    <div className={styles.hero}>
      <div className={styles.heroTop}>
        <h2 className={styles.heroWord}>{details.text}</h2>
        <div className={styles.heroBadges}>
          {badges.map((pos) => (
            <span key={pos} className={styles.heroBadge}>
              {pos}
            </span>
          ))}
          {details.category && badges.length <= 1 ? (
            <span className={`${styles.heroBadge} ${styles.heroBadgeMuted}`}>{details.category}</span>
          ) : null}
        </div>
      </div>
      {primaryPhonetic?.text || primaryPhonetic?.audio ? (
        <div className={styles.heroPhonetic}>
          {primaryPhonetic.text ? (
            <span className={styles.phoneticText}>{primaryPhonetic.text}</span>
          ) : null}
          <WordCardAudioButton audioUrl={primaryPhonetic.audio} className={styles.audioBtn} />
        </div>
      ) : null}
    </div>
  );
}
