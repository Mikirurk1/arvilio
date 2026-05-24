import { Injectable, Logger } from '@nestjs/common';
import { DictionaryApiProvider } from '../infrastructure/dictionary-providers/dictionary-api.provider';
import { WiktionaryProvider } from '../infrastructure/dictionary-providers/wiktionary.provider';
import type { DictionaryLookup } from '../shared/dictionary-lookup.types';
import { mergeDictionaryLookups } from '../shared/dictionary-merge.util';
import { PlatformSettingsService } from './platform-settings.service';

export type { DictionaryLookup } from '../shared/dictionary-lookup.types';

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

export {
  coerceDictionaryEntries,
  extractMeaningGroups,
  listPartsOfSpeech,
  mergeDictionaryEntries,
  normalizeAudioUrl,
} from '../shared/dictionary-payload.util';
