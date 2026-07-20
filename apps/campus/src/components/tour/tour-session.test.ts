import {
  isProductTourSessionActive,
  readProductTourCursor,
  setProductTourSessionActive,
  writeProductTourCursor,
} from './tour-session';
import { maybeDispatchVocabFirstWordsGuide, TOUR_FIRST_WORDS_EVENT } from './vocab-first-words';

describe('tour-session + first-words gate', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    setProductTourSessionActive(false);
    document.body.innerHTML = '';
  });

  it('blocks first-words dispatch while product tour session is active', () => {
    const spy = jest.fn();
    window.addEventListener(TOUR_FIRST_WORDS_EVENT, spy);
    setProductTourSessionActive(true);
    maybeDispatchVocabFirstWordsGuide(0);
    expect(spy).not.toHaveBeenCalled();
    window.removeEventListener(TOUR_FIRST_WORDS_EVENT, spy);
  });

  it('persists and restores tour cursor', () => {
    writeProductTourCursor({
      userId: 'u1',
      phase: 'A',
      index: 12,
      chapterId: null,
      chapterStepIndex: 0,
    });
    expect(readProductTourCursor('u1')?.index).toBe(12);
    expect(readProductTourCursor('other')).toBeNull();
    expect(isProductTourSessionActive()).toBe(false);
  });
});
