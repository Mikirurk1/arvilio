import { BadRequestException } from '@nestjs/common';
import type { StudentWordCardDto, WordCardDto, WordDefinitionDto } from '@pkg/types';
import { resolveVerbForms } from '@pkg/types';

export function dictionaryPayloadFromSource(sourcePayload?: unknown): unknown {
  if (!sourcePayload || typeof sourcePayload !== 'object') return null;
  const sp = sourcePayload as { dictionary?: unknown; dictionaryapi?: unknown };
  return sp.dictionary ?? sp.dictionaryapi ?? null;
}

export type VocabularyWordRow = {
  id: string;
  text: string;
  definition: string;
  example: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  category: string | null;
  audioUrl: string | null;
  origin: string | null;
  synonyms: string[];
  antonyms: string[];
  source: string | null;
  sourcePayload?: unknown;
  definitions: WordDefinitionDto[];
};

export function normalizeLemmaText(text: string): string {
  return text.trim().toLowerCase();
}

export function mapWordRow(word: VocabularyWordRow): WordCardDto {
  const definitions =
    word.definitions.length > 0
      ? word.definitions.map((d) => ({
          languageId: d.languageId,
          text: d.text,
          lemmaText: d.lemmaText ?? null,
          partOfSpeech: d.partOfSpeech || undefined,
        }))
      : [
          {
            languageId: 'en',
            text: word.definition,
            lemmaText: null,
            partOfSpeech: word.partOfSpeech ?? '',
          },
        ];
  return {
    id: word.id,
    text: word.text,
    definition: word.definition,
    definitions,
    example: word.example,
    phonetic: word.phonetic,
    partOfSpeech: word.partOfSpeech,
    category: word.category,
    audioUrl: word.audioUrl,
    origin: word.origin,
    synonyms: word.synonyms,
    antonyms: word.antonyms,
    source: word.source,
    verbForms: resolveVerbForms(word.text, word.partOfSpeech, definitions),
  };
}

export function statusToDto(
  status: 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED',
): StudentWordCardDto['status'] {
  return status.toLowerCase() as StudentWordCardDto['status'];
}

export function statusFromDto(
  status: StudentWordCardDto['status'],
): 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED' {
  return status.toUpperCase() as 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED';
}

export function encodeCardCursor(row: { createdAt: Date; id: string }): string {
  return `${row.createdAt.toISOString()}|${row.id}`;
}

export function decodeCardCursor(cursor: string): { createdAt: Date; id: string } {
  const parts = cursor.split('|');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new BadRequestException('Invalid vocabulary cursor');
  }
  return { createdAt: new Date(parts[0]), id: parts[1] };
}

export type VocabularyStudentCardRow = {
  id: string;
  status: 'NEW' | 'REPEATED' | 'MISTAKES_WORK' | 'LEARNED';
  masteryLevel: number;
  lessonId: string | null;
  firstSeenAt: Date | null;
  lastReviewedAt: Date | null;
  nextReviewAt: Date | null;
  knownAt: Date | null;
  createdAt: Date;
  word: VocabularyWordRow;
};

export function mapStudentCardDto(card: VocabularyStudentCardRow): StudentWordCardDto {
  return {
    id: card.id,
    word: mapWordRow(card.word),
    status: statusToDto(card.status),
    masteryLevel: card.masteryLevel,
    lessonId: card.lessonId,
    firstSeenAt: card.firstSeenAt?.toISOString() ?? null,
    lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    nextReviewAt: card.nextReviewAt?.toISOString() ?? null,
    knownAt: card.knownAt?.toISOString() ?? null,
  };
}
