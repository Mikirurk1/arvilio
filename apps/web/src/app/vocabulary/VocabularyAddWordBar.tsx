'use client';

import { useState, type FormEvent } from 'react';
import { Button, Field } from '../../components/ui';
import {
  validateEnglishWordInput,
  VOCABULARY_WORD_NOT_FOUND,
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
  const lookupWord = useVocabularyStore(s => s.lookupWord);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || adding) return;

    const englishError = validateEnglishWordInput(trimmed);
    if (englishError) {
      setError(englishError);
      return;
    }

    setAdding(true);
    setError(null);
    try {
      const result = await lookupWord(trimmed);
      if (!result.foundInDictionary) {
        setError(VOCABULARY_WORD_NOT_FOUND);
        return;
      }
      await onAdd(trimmed);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add word');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.addWordCard}>
      <form className={styles.addWordForm} onSubmit={onSubmit} noValidate>
        <Field
          className={styles.searchInput}
          type='text'
          placeholder='Add a word or phrase (English), e.g. touch base'
          value={text}
          onChange={event => setText(event.target.value)}
          disabled={disabled || adding}
        />
        <Button type='submit' disabled={disabled || adding || !text.trim()}>
          {adding ? 'Adding…' : 'Add word'}
        </Button>
      </form>
      {error ? <div className={styles.addWordError}>{error}</div> : null}
    </div>
  );
}
