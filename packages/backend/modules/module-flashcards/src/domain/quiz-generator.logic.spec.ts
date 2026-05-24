import {
  decodeQuizCursor,
  dedupeById,
  encodeQuizCursor,
  escapeRegex,
  maskWordInExample,
  shuffle,
} from './quiz-generator.logic';

describe('quiz-generator.logic', () => {
  it('encodeQuizCursor round-trips', () => {
    const row = { createdAt: new Date('2026-05-20T10:00:00.000Z'), id: 'q1' };
    const cursor = encodeQuizCursor(row);
    expect(decodeQuizCursor(cursor)).toEqual(row);
  });

  it('decodeQuizCursor rejects invalid cursor', () => {
    expect(() => decodeQuizCursor('bad')).toThrow('Invalid quiz cursor');
  });

  it('shuffle preserves elements', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out.sort()).toEqual(input.sort());
  });

  it('dedupeById keeps first occurrence', () => {
    expect(
      dedupeById([
        { id: 'a', v: 1 },
        { id: 'a', v: 2 },
        { id: 'b', v: 3 },
      ]),
    ).toHaveLength(2);
  });

  it('maskWordInExample masks word in sentence', () => {
    expect(maskWordInExample('I like coffee.', 'coffee')).toBe('I like _____.');
    expect(maskWordInExample('No match', 'tea')).toBeNull();
  });

  it('escapeRegex escapes special characters', () => {
    expect(escapeRegex('a+b?')).toBe('a\\+b\\?');
  });
});
