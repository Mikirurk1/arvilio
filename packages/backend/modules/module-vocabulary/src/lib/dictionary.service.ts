import { Injectable, Logger } from '@nestjs/common';
import {
  coerceDictionaryEntries,
  extractMeaningGroups,
  listPartsOfSpeech,
  mergeDictionaryEntries,
  type DictionaryApiEntry,
} from './dictionary-payload.util';
import { DictionaryApiProvider } from './dictionary-providers/dictionary-api.provider';
import { WiktionaryProvider } from './dictionary-providers/wiktionary.provider';
import type { DictionaryLookup } from './dictionary-lookup.types';
import { PlatformSettingsService } from './platform-settings.service';

export type { DictionaryLookup } from './dictionary-lookup.types';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private readonly dictionaryApi = new DictionaryApiProvider();
  private readonly wiktionary = new WiktionaryProvider();

  constructor(private readonly platformSettings: PlatformSettingsService) {}

  async lookup(rawText: string): Promise<DictionaryLookup | null> {
    const provider = await this.platformSettings.getWordDictionaryProvider();
    if (provider === 'wiktionary') {
      const [wikti, dictApi] = await Promise.all([
        this.wiktionary.lookup(rawText),
        this.dictionaryApi.lookup(rawText),
      ]);
      if (wikti) {
        return mergeDictionaryLookups(wikti, dictApi);
      }
      if (dictApi) return dictApi;
      this.logger.debug(`Wiktionary + Dictionary API miss for "${rawText}"`);
      return null;
    }
    return this.dictionaryApi.lookup(rawText);
  }
}

/** Wiktionary definitions + Dictionary API phonetics/audio/synonyms. */
function mergeDictionaryLookups(
  primary: DictionaryLookup,
  supplemental: DictionaryLookup | null,
): DictionaryLookup {
  if (!supplemental) return primary;

  const sources = new Set<string>([primary.source, supplemental.source]);

  return {
    ...primary,
    phonetic: primary.phonetic ?? supplemental.phonetic,
    audioUrl: primary.audioUrl ?? supplemental.audioUrl,
    origin: primary.origin ?? supplemental.origin,
    synonyms: dedupeStrings([...primary.synonyms, ...supplemental.synonyms]).slice(0, 12),
    antonyms: dedupeStrings([...primary.antonyms, ...supplemental.antonyms]).slice(0, 12),
    source: [...sources].join('+'),
    payload: mergePayloadPhonetics(primary.payload, supplemental.payload),
  };
}

function mergePayloadPhonetics(
  primary: DictionaryApiEntry[],
  supplemental: DictionaryApiEntry[],
): DictionaryApiEntry[] {
  if (supplemental.length === 0) return primary;
  const sup = supplemental[0];
  if (primary.length === 0) return supplemental;

  return primary.map((entry, i) => {
    if (i !== 0) return entry;
    const phonetics = [
      ...(entry.phonetics ?? []),
      ...(sup.phonetics ?? []),
    ];
    return {
      ...entry,
      phonetic: entry.phonetic ?? sup.phonetic,
      phonetics: phonetics.length > 0 ? phonetics : entry.phonetics,
    };
  });
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

export {
  coerceDictionaryEntries,
  extractMeaningGroups,
  listPartsOfSpeech,
  mergeDictionaryEntries,
  normalizeAudioUrl,
} from './dictionary-payload.util';
