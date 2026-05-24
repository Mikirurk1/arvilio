import { BadRequestException } from '@nestjs/common';
import {
  decodeCardCursor,
  dictionaryPayloadFromSource,
  encodeCardCursor,
  mapStudentCardDto,
  mapWordRow,
  normalizeLemmaText,
  statusFromDto,
  statusToDto,
} from './vocabulary-map.util';

const wordRow = {
  id: 'w1',
  text: 'Run',
  definition: 'to move fast',
  example: null,
  phonetic: null,
  partOfSpeech: 'verb',
  category: null,
  audioUrl: null,
  origin: null,
  synonyms: [],
  antonyms: [],
  source: null,
  definitions: [{ id: 'd1', languageId: 'uk', text: 'бігти', lemmaText: null, partOfSpeech: 'verb' }],
};

describe('vocabulary-map.util', () => {
  it('normalizeLemmaText trims and lowercases', () => {
    expect(normalizeLemmaText('  Hello ')).toBe('hello');
  });

  it('dictionaryPayloadFromSource picks dictionary or dictionaryapi', () => {
    expect(dictionaryPayloadFromSource({ dictionary: { x: 1 } })).toEqual({ x: 1 });
    expect(dictionaryPayloadFromSource({ dictionaryapi: [1] })).toEqual([1]);
    expect(dictionaryPayloadFromSource(null)).toBeNull();
  });

  it('mapWordRow includes irregular verb forms', () => {
    const card = mapWordRow(wordRow);
    expect(card.text).toBe('Run');
    expect(card.verbForms?.pastSimple).toBe('ran');
  });

  it('status mappers round-trip', () => {
    expect(statusToDto('LEARNED')).toBe('learned');
    expect(statusFromDto('mistakes_work')).toBe('MISTAKES_WORK');
  });

  it('card cursor encode/decode', () => {
    const createdAt = new Date('2026-05-20T10:00:00.000Z');
    const cursor = encodeCardCursor({ createdAt, id: 'card-1' });
    expect(decodeCardCursor(cursor)).toEqual({ createdAt, id: 'card-1' });
    expect(() => decodeCardCursor('bad')).toThrow(BadRequestException);
  });

  it('mapStudentCardDto maps dates to ISO strings', () => {
    const dto = mapStudentCardDto({
      id: 'c1',
      status: 'NEW',
      masteryLevel: 0,
      lessonId: null,
      firstSeenAt: new Date('2026-05-20T10:00:00.000Z'),
      lastReviewedAt: null,
      nextReviewAt: null,
      knownAt: null,
      createdAt: new Date('2026-05-20T10:00:00.000Z'),
      word: wordRow,
    });
    expect(dto.status).toBe('new');
    expect(dto.firstSeenAt).toBe('2026-05-20T10:00:00.000Z');
  });
});
