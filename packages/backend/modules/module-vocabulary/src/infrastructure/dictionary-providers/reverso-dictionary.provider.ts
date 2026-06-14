import { Logger } from '@nestjs/common';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import { reversoTranslate } from '../reverso/reverso.client';
import { DictionaryApiProvider } from './dictionary-api.provider';
import type { DictionaryLookup } from '../../shared/dictionary-lookup.types';

/** English lookup enriched with Reverso context translations (direct HTTP API). */
export class ReversoDictionaryProvider {
  private readonly logger = new Logger(ReversoDictionaryProvider.name);
  private readonly dictionaryApi = new DictionaryApiProvider();

  async lookup(rawText: string): Promise<DictionaryLookup | null> {
    const text = rawText.trim().toLowerCase();
    if (!text) return null;

    const runtime = getPlatformIntegrationRuntime().translation;
    if (runtime.activeProvider !== 'reverso') {
      this.logger.debug('Reverso dictionary provider disabled; falling back to Dictionary API');
      return this.dictionaryApi.lookup(rawText);
    }

    const targetLang = runtime.reversoContextTargetLang || 'uk';
    const [dictApi, reverso] = await Promise.all([
      this.dictionaryApi.lookup(rawText),
      reversoTranslate(text, 'en', targetLang, {
        apiUrl: runtime.reversoApiUrl,
        apiKey: runtime.reversoApiKey,
        contextResults: runtime.reversoContextResults,
      }),
    ]);

    if (!dictApi && !reverso) return null;

    const example = reverso?.examples[0]?.source ?? dictApi?.example ?? null;
    const contextTranslations = reverso?.translations ?? [];
    const synonyms = dedupe([...(dictApi?.synonyms ?? []), ...contextTranslations.slice(1)]).slice(0, 12);

    return {
      text,
      definition: dictApi?.definition ?? contextTranslations[0] ?? '—',
      example,
      phonetic: dictApi?.phonetic ?? null,
      partOfSpeech: dictApi?.partOfSpeech ?? null,
      origin: dictApi?.origin ?? null,
      audioUrl: dictApi?.audioUrl ?? null,
      synonyms,
      antonyms: dictApi?.antonyms ?? [],
      source: 'reverso',
      payload: dictApi?.payload ?? [],
      reversoRaw: reverso
        ? {
            targetLang,
            translations: reverso.translations,
            examples: reverso.examples,
            detectedLanguage: reverso.detectedLanguage,
          }
        : null,
    };
  }
}

function dedupe(items: string[]): string[] {
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
