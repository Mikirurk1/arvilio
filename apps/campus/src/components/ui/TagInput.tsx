'use client';

import { useId, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import {
  addTag,
  filterTagSuggestions,
  parseTagsFromText,
  removeTag,
} from '../../lib/tag-list';
import uiStyles from './ui.module.scss';
import styles from './TagInput.module.scss';

export type TagInputProps = {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
  className?: string;
  maxTags?: number;
};

export function TagInput({
  id: idProp,
  label,
  hint,
  error,
  value,
  onChange,
  placeholder = 'Type and press Enter',
  suggestions = [],
  disabled = false,
  className,
  maxTags,
}: TagInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');

  const atLimit = maxTags !== undefined && value.length >= maxTags;

  const visibleSuggestions = useMemo(
    () => filterTagSuggestions(suggestions, value, draft).slice(0, 12),
    [draft, suggestions, value],
  );

  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const commitDraft = () => {
    if (!draft.trim() || atLimit) {
      setDraft('');
      return;
    }
    onChange(addTag(value, draft));
    setDraft('');
  };

  const commitMany = (text: string) => {
    if (atLimit) return;
    let next = parseTagsFromText(text, value);
    if (maxTags !== undefined) {
      next = next.slice(0, maxTags);
    }
    onChange(next);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (draft.includes(',') || draft.includes(';')) {
        commitMany(draft);
        return;
      }
      commitDraft();
      return;
    }

    if (event.key === 'Backspace' && !draft && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!/[,;\n]/.test(text)) return;
    event.preventDefault();
    commitMany(text);
  };

  const focusInput = () => {
    if (disabled) return;
    inputRef.current?.focus();
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {label ? (
        <label htmlFor={id} className={uiStyles.fieldLabel}>
          {label}
        </label>
      ) : null}

      <div
        className={[styles.shell, disabled ? styles.shellDisabled : ''].filter(Boolean).join(' ')}
        onClick={focusInput}
      >
        {value.map((tag) => (
          <span key={tag} className={styles.chip}>
            <span className={styles.chipLabel}>{tag}</span>
            <Button
              variant="bare"
              type="button"
              className={styles.chipRemove}
              aria-label={`Remove tag ${tag}`}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onChange(removeTag(value, tag));
              }}
            >
              <X size={12} aria-hidden />
            </Button>
          </span>
        ))}

        {!atLimit ? (
          <input
            ref={inputRef}
            id={id}
            className={styles.input}
            value={draft}
            disabled={disabled}
            placeholder={value.length === 0 ? placeholder : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commitDraft}
            onPaste={onPaste}
          />
        ) : null}
      </div>

      {visibleSuggestions.length > 0 ? (
        <div className={styles.suggestions} role="listbox" aria-label="Suggested tags">
          {visibleSuggestions.map((tag) => (
            <Button
              key={tag}
              variant="bare"
              type="button"
              role="option"
              className={styles.suggestion}
              disabled={disabled || atLimit}
              onClick={() => onChange(addTag(value, tag))}
            >
              {tag}
            </Button>
          ))}
        </div>
      ) : null}

      {error ? (
        <small id={errorId} className={uiStyles.fieldError}>
          {error}
        </small>
      ) : null}
      {hint && !error ? (
        <small id={hintId} className={uiStyles.fieldHint}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}
