import { Injectable } from '@nestjs/common';
import { PrismaService } from '@soenglish/data-access-prisma';
import type { WordDefinitionDto } from '@soenglish/shared-types';
import { coerceDictionaryEntries, extractMeaningGroups } from './dictionary.service';
import { clipForTranslation, stripHtml } from './strip-html.util';
import { DatamuseProvider } from './datamuse.provider';
import { DictionaryService } from './dictionary.service';
import { TranslationService } from './translation.service';

export type EnrichedWordData = {
  text: string;
  normalizedText: string;
  /** True when the configured dictionary provider returned an entry for this lemma. */
  dictionaryFound: boolean;
  definition: string;
  definitions: WordDefinitionDto[];
  example: string | null;
  phonetic: string | null;
  partOfSpeech: string | null;
  category: string | null;
  audioUrl: string | null;
  origin: string | null;
  synonyms: string[];
  antonyms: string[];
  source: string;
  sourcePayload: object;
};

@Injectable()
export class WordEnrichmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dictionary: DictionaryService,
    private readonly datamuse: DatamuseProvider,
    private readonly translation: TranslationService,
  ) {}

  async enrich(text: string, overrides?: Partial<EnrichedWordData>): Promise<EnrichedWordData> {
    const trimmed = text.trim();
    const normalizedText = trimmed.toLowerCase();
    const [dict, dmuse, languages] = await Promise.all([
      this.dictionary.lookup(trimmed),
      this.datamuse.lookup(trimmed),
      this.prisma.language.findMany({
        where: { isActive: true },
        select: { id: true, code: true },
      }),
    ]);

    const sources: string[] = [];
    if (dict) sources.push(dict.source);
    if (dmuse) sources.push('datamuse');

    const entries = coerceDictionaryEntries(dict?.payload);
    const meaningGroups =
      entries.length > 0
        ? extractMeaningGroups(entries)
        : [
            {
              partOfSpeech: dict?.partOfSpeech ?? 'general',
              definition:
                overrides?.definition?.trim() ||
                dict?.definition ||
                dmuse?.definition ||
                '—',
              example: dict?.example ?? null,
            },
          ];

    const primaryGroup = meaningGroups[0];
    const definition = stripHtml(
      overrides?.definition?.trim() ||
        primaryGroup?.definition ||
        dict?.definition ||
        dmuse?.definition ||
        '—',
    );

    const englishLang = languages.find((l) => l.code === 'en');
    const definitions: WordDefinitionDto[] = [];
    const targetLangs = languages.filter((l) => l.code !== 'en');

    const lemmaByLangId = new Map<string, string | null>();
    await Promise.all(
      targetLangs.map(async (lang) => {
        const lemma = await this.translation.translate(trimmed, 'en', lang.code);
        lemmaByLangId.set(lang.id, lemma);
      }),
    );

    for (const group of meaningGroups) {
      const pos = group.partOfSpeech || 'general';
      if (englishLang) {
        definitions.push({
          languageId: englishLang.id,
          text: group.definition,
          lemmaText: trimmed,
          partOfSpeech: pos,
        });
      }

      const defForTranslation = clipForTranslation(group.definition);
      await Promise.all(
        targetLangs.map(async (lang) => {
          const lemmaText = lemmaByLangId.get(lang.id) ?? null;
          const translatedDef = await this.translation.translate(defForTranslation, 'en', lang.code);
          if (!lemmaText && !translatedDef) return;
          definitions.push({
            languageId: lang.id,
            text: translatedDef ?? lemmaText ?? '—',
            lemmaText: lemmaText ?? null,
            partOfSpeech: pos,
          });
        }),
      );
    }

    if (overrides?.definitions?.length) {
      for (const row of overrides.definitions) {
        const pos = row.partOfSpeech ?? '';
        const idx = definitions.findIndex(
          (d) => d.languageId === row.languageId && (d.partOfSpeech ?? '') === pos,
        );
        if (idx >= 0) definitions[idx] = row;
        else definitions.push(row);
      }
    }

    const partOfSpeech = overrides?.partOfSpeech ?? dict?.partOfSpeech ?? primaryGroup?.partOfSpeech ?? null;
    const category = overrides?.category ?? categoryFromPos(partOfSpeech);

    return {
      text: trimmed,
      normalizedText,
      dictionaryFound: Boolean(dict),
      definition,
      definitions: dedupeDefinitionDtos(definitions),
      example: stripHtml(
        overrides?.example ?? primaryGroup?.example ?? dict?.example ?? '',
      ) || null,
      phonetic: overrides?.phonetic ?? dict?.phonetic ?? null,
      partOfSpeech,
      category,
      audioUrl: overrides?.audioUrl ?? dict?.audioUrl ?? null,
      origin: overrides?.origin ?? dict?.origin ?? null,
      synonyms: dedupeStrings([
        ...(overrides?.synonyms ?? []),
        ...(dict?.synonyms ?? []),
        ...(dmuse?.synonyms ?? []),
      ]).slice(0, 12),
      antonyms: dedupeStrings([
        ...(overrides?.antonyms ?? []),
        ...(dict?.antonyms ?? []),
        ...(dmuse?.antonyms ?? []),
      ]).slice(0, 12),
      source: sources.length > 0 ? `combined:${sources.join('+')}` : 'manual',
      sourcePayload: {
        provider: dict?.source ?? null,
        dictionary: dict?.payload ?? null,
        dictionaryapi: dict?.payload ?? null,
        wiktionary: dict?.wiktionaryRaw ?? null,
        datamuse: dmuse?.payload ?? null,
      },
    };
  }
}

function categoryFromPos(partOfSpeech: string | null): string {
  if (!partOfSpeech) return 'general';
  const pos = partOfSpeech.toLowerCase();
  if (pos.includes('verb')) return 'verbs';
  if (pos.includes('noun')) return 'nouns';
  if (pos.includes('adjective') || pos === 'adj') return 'adjectives';
  if (pos.includes('adverb') || pos === 'adv') return 'adverbs';
  return 'general';
}

function dedupeDefinitionDtos(definitions: WordDefinitionDto[]): WordDefinitionDto[] {
  const byKey = new Map<string, WordDefinitionDto>();
  for (const row of definitions) {
    const key = `${row.languageId}|${(row.partOfSpeech ?? '').toLowerCase()}`;
    if (!byKey.has(key)) byKey.set(key, row);
  }
  return [...byKey.values()];
}

function dedupeStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const value = item?.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
