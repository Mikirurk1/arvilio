import { Injectable, Logger } from '@nestjs/common';
import type { WordDictionaryProviderId } from '@pkg/types';
import { DictionaryApiProvider } from '../infrastructure/dictionary-providers/dictionary-api.provider';
import { ReversoDictionaryProvider } from '../infrastructure/dictionary-providers/reverso-dictionary.provider';
import { WiktionaryProvider } from '../infrastructure/dictionary-providers/wiktionary.provider';
import type { DictionaryLookup } from '../shared/dictionary-lookup.types';
import { dictionaryProviderOrder } from './dictionary-provider.util';
import { PlatformSettingsService } from './platform-settings.service';

export type { DictionaryLookup } from '../shared/dictionary-lookup.types';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);
  private readonly dictionaryApi = new DictionaryApiProvider();
  private readonly wiktionary = new WiktionaryProvider();
  private readonly reverso = new ReversoDictionaryProvider();

  constructor(private readonly platformSettings: PlatformSettingsService) {}

  async lookup(rawText: string): Promise<DictionaryLookup | null> {
    const primary = await this.platformSettings.getWordDictionaryProvider();
    const order = dictionaryProviderOrder(primary);

    for (const providerId of order) {
      const result = await this.lookupWithProvider(providerId, rawText);
      if (result) {
        if (providerId !== primary) {
          this.logger.debug(
            `Dictionary fallback ${primary}→${providerId} for "${rawText.trim()}"`,
          );
        }
        return result;
      }
    }

    this.logger.debug(`Dictionary miss for "${rawText.trim()}" after ${order.join(' → ')}`);
    return null;
  }

  private lookupWithProvider(
    providerId: WordDictionaryProviderId,
    rawText: string,
  ): Promise<DictionaryLookup | null> {
    switch (providerId) {
      case 'dictionary_api_dev':
        return this.dictionaryApi.lookup(rawText);
      case 'wiktionary':
        return this.wiktionary.lookup(rawText);
      case 'reverso':
        return this.reverso.lookup(rawText);
      default:
        return Promise.resolve(null);
    }
  }
}

export {
  coerceDictionaryEntries,
  extractMeaningGroups,
  listPartsOfSpeech,
  mergeDictionaryEntries,
  normalizeAudioUrl,
} from '../shared/dictionary-payload.util';
