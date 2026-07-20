'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '../ui';
import { buildHeaderSearchResults } from '../../lib/header-search';
import { useActiveUser } from '../../lib/active-user';
import { useLessonPartyOptions } from '../../hooks/use-lesson-party-options';
import { isTeacherAdminOrSuper } from '../../lib/roles';
import { useLessonsStore } from '../../stores/lessons-store';
import { useStudentsStore } from '../../stores/students-store';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { useCampusT } from '../../lib/cms';
import styles from './HeaderSearch.module.scss';

export function HeaderSearch() {
  const t = useCampusT();
  const router = useRouter();
  const activeUser = useActiveUser();
  const { nameByNumericId } = useLessonPartyOptions();
  const fetchLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const lessons = useLessonsStore((s) => s.backendLessons.data);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const students = useStudentsStore((s) => s.list.data);
  const fetchCards = useVocabularyStore((s) => s.fetchCards);
  const cards = useVocabularyStore((s) => s.cards.data);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [kbdHint, setKbdHint] = useState('⌘K');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) { setKbdHint(''); return; }
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
    setKbdHint(isMac ? '⌘K' : 'Ctrl K');
  }, []);

  const includeStudents = isTeacherAdminOrSuper(activeUser.role);

  useEffect(() => {
    void fetchLessons();
    if (includeStudents) void fetchStudents();
    void fetchCards();
  }, [fetchCards, fetchLessons, fetchStudents, includeStudents]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(
    () =>
      buildHeaderSearchResults({
        query,
        lessons: lessons ?? [],
        nameByNumericId,
        students: students ?? [],
        vocabularyCards: cards ?? [],
        includeStudents,
      }),
    [cards, includeStudents, lessons, nameByNumericId, query, students],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (results[0]) {
      router.push(results[0].href);
      setOpen(false);
      return;
    }
    router.push(`/vocabulary?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <form className={styles.searchBox} onSubmit={onSubmit} role="search">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <Field
          ref={inputRef}
          id="header-search-input"
          type="search"
          className={styles.input}
          placeholder={t('header.searchPlaceholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label={t('header.searchPlaceholder')}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && query.trim().length > 0}
          aria-controls="header-search-results"
        />
        {!query ? <span className={styles.kbd}>{kbdHint}</span> : null}
      </form>
      {open && query.trim() ? (
        <div id="header-search-results" className={styles.dropdown} role="listbox">
          {results.length === 0 ? (
            <p className={styles.empty}>No matches. Press Enter to search vocabulary.</p>
          ) : (
            results.map((row) => (
              <Button
                key={row.id}
                type="button"
                variant="ghost"
                role="option"
                className={styles.result}
                onClick={() => {
                  router.push(row.href);
                  setOpen(false);
                }}
              >
                <span className={styles.resultType}>{row.type}</span>
                <span className={styles.resultLabel}>{row.label}</span>
                {row.sublabel ? <span className={styles.resultSub}>{row.sublabel}</span> : null}
              </Button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
