import { Logger } from '@nestjs/common';
import {
  extractMeaningGroups,
  mergeDictionaryEntries,
  primarySenseFromEntries,
  type DictionaryApiEntry,
} from '../dictionary-payload.util';
import { normalizeAudioUrl } from '../dictionary-payload.util';
import type { DictionaryLookup } from '../dictionary-lookup.types';

const DICTIONARY_API =
  process.env.DICTIONARY_API_URL ?? 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export class DictionaryApiProvider {
  private readonly logger = new Logger(DictionaryApiProvider.name);

  async lookup(rawText: string): Promise<DictionaryLookup | null> {
    const text = rawText.trim().toLowerCase();
    if (!text) return null;
    try {
      const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(text)}`);
      if (!response.ok) {
        this.logger.debug(`Dictionary API lookup for "${text}" failed: ${response.status}`);
        return null;
      }
      const data = (await response.json()) as DictionaryApiEntry[];
      const entries = Array.isArray(data) ? data : [];
      if (entries.length === 0) return null;

      const primary = primarySenseFromEntries(entries);
      const merged = mergeDictionaryEntries(entries);

      const synonyms: string[] = [];
      const antonyms: string[] = [];
      for (const meaning of merged.meanings) {
        synonyms.push(...(meaning.synonyms ?? []));
        antonyms.push(...(meaning.antonyms ?? []));
        for (const row of meaning.definitions ?? []) {
          synonyms.push(...(row.synonyms ?? []));
          antonyms.push(...(row.antonyms ?? []));
        }
      }

      const phonetics = merged.phonetics ?? [];
      const audioRow = phonetics.find((p) => normalizeAudioUrl(p.audio));
      const phonetic =
        audioRow?.text?.trim() ||
        merged.phonetic?.trim() ||
        phonetics.find((p) => p.text?.trim())?.text?.trim() ||
        null;

      return {
        text,
        definition: primary.definition,
        example: primary.example,
        phonetic,
        partOfSpeech: primary.partOfSpeech,
        origin: merged.origin,
        audioUrl: normalizeAudioUrl(audioRow?.audio),
        synonyms: dedupe(synonyms).slice(0, 12),
        antonyms: dedupe(antonyms).slice(0, 12),
        source: 'dictionaryapi.dev',
        payload: entries,
      };
    } catch (err) {
      this.logger.error(`Dictionary API lookup error for "${text}"`, err as Error);
      return null;
    }
  }
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const value = item?.trim().toLowerCase();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(item.trim());
  }
  return out;
}
