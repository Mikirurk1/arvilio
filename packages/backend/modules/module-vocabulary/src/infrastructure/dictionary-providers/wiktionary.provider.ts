import { Logger } from '@nestjs/common';
import {
  primarySenseFromEntries,
  type DictionaryApiEntry,
  type DictionaryMeaning,
} from '../../shared/dictionary-payload.util';
import type { DictionaryLookup } from '../../shared/dictionary-lookup.types';
import { isUsablePlainText, stripHtml } from '../../domain/strip-html.util';

const WIKTIONARY_DEFINITION_API =
  process.env['WIKTIONARY_API_URL'] ?? 'https://en.wiktionary.org/api/rest_v1/page/definition/';

const USER_AGENT =
  process.env['WIKTIONARY_USER_AGENT'] ?? 'Arvilio/1.0 (vocabulary; +https://github.com/arvilio)';

const MAX_DEFINITIONS_PER_POS = 12;

type WiktionarySense = {
  partOfSpeech: string;
  language: string;
  definitions: Array<{
    definition?: string;
    examples?: string[];
    parsedExamples?: Array<{ example?: string; translation?: string }>;
  }>;
};

export type WiktionaryDefinitionResponse = Record<string, WiktionarySense[]>;

export class WiktionaryProvider {
  private readonly logger = new Logger(WiktionaryProvider.name);

  async lookup(rawText: string): Promise<DictionaryLookup | null> {
    const text = rawText.trim().toLowerCase();
    if (!text) return null;

    try {
      const url = `${WIKTIONARY_DEFINITION_API}${encodeURIComponent(text)}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      if (!response.ok) {
        this.logger.debug(`Wiktionary lookup for "${text}" failed: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as WiktionaryDefinitionResponse;
      const entries = wiktionaryToEntries(text, data);
      if (entries.length === 0) return null;

      const primary = primarySenseFromEntries(entries);

      return {
        text,
        definition: primary.definition,
        example: primary.example,
        phonetic: null,
        partOfSpeech: primary.partOfSpeech,
        origin: null,
        audioUrl: null,
        synonyms: [],
        antonyms: [],
        source: 'wiktionary',
        payload: entries,
        wiktionaryRaw: data,
      };
    } catch (err) {
      this.logger.error(`Wiktionary lookup error for "${text}"`, err as Error);
      return null;
    }
  }
}

function cleanExample(raw: string | null | undefined): string | null {
  const plain = stripHtml(raw ?? '');
  return isUsablePlainText(plain) ? plain : null;
}

function collectExamples(row: WiktionarySense['definitions'][number]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const add = (value?: string | null) => {
    const ex = cleanExample(value);
    if (!ex) return;
    const key = ex.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(ex);
  };

  for (const parsed of row.parsedExamples ?? []) {
    add(parsed.example);
  }
  for (const ex of row.examples ?? []) {
    add(ex);
  }

  return out;
}

export function wiktionaryToEntries(
  word: string,
  data: WiktionaryDefinitionResponse,
): DictionaryApiEntry[] {
  const enSections = data['en'] ?? [];
  if (enSections.length === 0) return [];

  const meanings: DictionaryMeaning[] = enSections
    .map((section) => {
      const pos = section.partOfSpeech?.trim().toLowerCase() || 'general';
      const seenDefs = new Set<string>();
      const definitions: NonNullable<DictionaryMeaning['definitions']> = [];

      for (const row of section.definitions ?? []) {
        const definition = stripHtml(row.definition ?? '');
        if (!isUsablePlainText(definition)) continue;

        const key = definition.toLowerCase();
        if (seenDefs.has(key)) continue;
        seenDefs.add(key);

        const examples = collectExamples(row);
        definitions.push({
          definition,
          example: examples[0] ?? null,
          synonyms: [],
          antonyms: [],
        });

        if (definitions.length >= MAX_DEFINITIONS_PER_POS) break;
      }

      if (definitions.length === 0) return null;
      return { partOfSpeech: pos, definitions, synonyms: [], antonyms: [] };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (meanings.length === 0) return [];

  return [{ word, meanings }];
}
