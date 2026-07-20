import type { TourStep } from './tracks/types';
import { isProductTourSessionActive, isProductTourUiOpen } from './tour-session';

/** localStorage: set when empty-deck first-words guide is finished or skipped. */
export const ARVI_VOCAB_FIRST_WORDS_KEY = 'arvi.vocabFirstWordsGuide';

/** Dispatched from Vocabulary page when deck is empty and guide not done. */
export const TOUR_FIRST_WORDS_EVENT = 'arvilio:tour-first-words';

export function isVocabFirstWordsGuideDone(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(ARVI_VOCAB_FIRST_WORDS_KEY) === 'done';
  } catch {
    return true;
  }
}

export function markVocabFirstWordsGuideDone(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ARVI_VOCAB_FIRST_WORDS_KEY, 'done');
  } catch {
    /* ignore quota / private mode */
  }
}

/** One-shot empty-deck guide steps (not Help; does not complete Level A). */
export function getVocabFirstWordsSteps(): TourStep[] {
  return [
    {
      id: 'first-words-modes',
      title: 'Your vocabulary deck',
      body: 'List, Flashcards, and Play live here. First, add a few words so you have something to study.',
      area: 'Vocabulary',
      navHref: '/vocabulary',
      anchorId: 'vocab-mode-toggle',
      pose: 'greet',
      uaIntent: 'Режими + перші слова',
    },
    {
      id: 'first-words-add',
      title: 'Add your first words',
      body: 'Type an English word below to look it up and add it to your deck. Two or more cards unlock Play.',
      area: 'Vocabulary',
      navHref: '/vocabulary',
      anchorId: 'vocab-add-word',
      pose: 'point',
      uaIntent: 'Додати перші слова',
    },
  ];
}

export function maybeDispatchVocabFirstWordsGuide(cardCount: number): void {
  if (typeof window === 'undefined') return;
  if (cardCount > 0) return;
  if (isVocabFirstWordsGuideDone()) return;
  // Never restart / steal focus from the full product tour or chapters.
  if (isProductTourSessionActive() || isProductTourUiOpen()) return;
  window.dispatchEvent(new Event(TOUR_FIRST_WORDS_EVENT));
}
