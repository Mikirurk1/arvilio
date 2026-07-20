'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field } from '../../components/ui';
import { signalTourQuest } from '../../components/tour/tour-quest-detect';
import { useCampusT } from '../../lib/cms';
import {
  validateEnglishWordInput,
} from '../../lib/vocabulary-word-input';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import styles from './page.module.scss';

export function VocabularyAddWordBar({
  onAdd,
  disabled = false,
}: {
  onAdd: (text: string) => Promise<void>;
  disabled?: boolean;
}) {
  const t = useCampusT();
  const lookupWord = useVocabularyStore((s) => s.lookupWord);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || adding) return;

    const englishError = validateEnglishWordInput(trimmed);
    if (englishError) {
      setError(
        englishError.startsWith('Enter')
          ? t('vocabulary.add.enterWord')
          : t('vocabulary.add.englishOnly'),
      );
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const result = await lookupWord(trimmed);
      if (!result.foundInDictionary) {
        setError(t('vocabulary.add.notFound'));
        return;
      }
      signalTourQuest({ eventId: 'vocab_lookup_ok' });
      await onAdd(trimmed);
      signalTourQuest({ eventId: 'vocab_word_added' });
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('vocabulary.add.failed'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.addWordCard} data-tour-anchor="vocab-add-word">
      <form className={styles.addWordForm} onSubmit={onSubmit} noValidate>
        <Field
          className={styles.searchInput}
          type="text"
          placeholder={t('vocabulary.add.placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={disabled || adding}
        />
        <Button type="submit" disabled={disabled || adding || !text.trim()}>
          {adding ? t('vocabulary.add.adding') : t('vocabulary.add.submit')}
        </Button>
      </form>
      {error ? <div className={styles.addWordError}>{error}</div> : null}
    </div>
  );
}
