import { Injectable, Logger } from '@nestjs/common';
import { getPlatformIntegrationRuntime } from '@be/platform-integration';
import type { TranslationProviderId } from '@pkg/types';
import { reversoTranslate } from '../infrastructure/reverso/reverso.client';
import { deeplTranslate } from '../infrastructure/deepl/deepl.client';
import { googleCloudTranslate } from '../infrastructure/google-translate/google-translate.client';
import { microsoftTranslate } from '../infrastructure/microsoft-translator/microsoft-translator.client';
import { translationProviderOrder } from './translation-provider.util';

type MyMemoryResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
  responseDetails?: string;
};

const MYMEMORY_WARNING = /MYMEMORY WARNING|QUOTA|USAGE LIMIT/i;

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  async translate(text: string, fromCode: string, toCode: string): Promise<string | null> {
    const meta = await this.translateWithMeta(text, fromCode, toCode);
    return meta?.text ?? null;
  }

  async translateWithMeta(
    text: string,
    fromCode: string,
    toCode: string,
  ): Promise<{ text: string; providerId?: TranslationProviderId } | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const from = fromCode.trim().toLowerCase();
    const to = toCode.trim().toLowerCase();
    if (from === to) return { text: trimmed };

    const runtime = getPlatformIntegrationRuntime().translation;
    const order = translationProviderOrder(runtime.activeProvider);

    for (const providerId of order) {
      const translated = await this.translateWithProvider(providerId, trimmed, from, to, runtime);
      if (translated) return { text: translated, providerId };
    }

    this.logger.warn(
      `Translation ${from}->${to} failed for all providers. Set a translation provider and contact email in System → Word dictionary.`,
    );
    return null;
  }

  private async translateWithProvider(
    providerId: TranslationProviderId,
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    switch (providerId) {
      case 'deepl':
        if (!runtime.deeplAuthKey) return null;
        return this.translateDeepL(text, from, to, runtime);
      case 'google':
        if (!runtime.googleTranslateApiKey) return null;
        return this.translateGoogleCloud(text, from, to, runtime);
      case 'microsoft':
        if (!runtime.azureTranslatorKey || !runtime.azureTranslatorRegion) return null;
        return this.translateMicrosoft(text, from, to, runtime);
      case 'reverso':
        return this.translateReverso(text, from, to, runtime);
      case 'mymemory':
        return this.translateMyMemory(text, from, to, runtime);
      case 'libretranslate':
        if (!runtime.libreTranslateUrl) return null;
        return this.translateLibre(text, from, to, runtime);
      case 'gtx': {
        const gtx = await this.translateGoogleGtx(text, from, to);
        if (gtx) {
          this.logger.debug(`Translation ${from}->${to} via GTX fallback`);
        }
        return gtx;
      }
      default:
        return null;
    }
  }

  private async translateDeepL(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    const translated = await deeplTranslate(text, from, to, {
      apiUrl: runtime.deeplApiUrl,
      authKey: runtime.deeplAuthKey ?? '',
    });
    if (translated) this.logger.debug(`Translation ${from}->${to} via DeepL`);
    return translated;
  }

  private async translateGoogleCloud(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    const translated = await googleCloudTranslate(text, from, to, {
      apiUrl: runtime.googleTranslateApiUrl,
      apiKey: runtime.googleTranslateApiKey ?? '',
    });
    if (translated) this.logger.debug(`Translation ${from}->${to} via Google Cloud Translation`);
    return translated;
  }

  private async translateMicrosoft(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    const translated = await microsoftTranslate(text, from, to, {
      apiUrl: runtime.microsoftTranslatorApiUrl,
      subscriptionKey: runtime.azureTranslatorKey ?? '',
      region: runtime.azureTranslatorRegion ?? '',
    });
    if (translated) this.logger.debug(`Translation ${from}->${to} via Microsoft Translator`);
    return translated;
  }

  private async translateReverso(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    try {
      const result = await reversoTranslate(text, from, to, {
        apiUrl: runtime.reversoApiUrl,
        apiKey: runtime.reversoApiKey,
        contextResults: runtime.reversoContextResults,
      });
      if (!result?.translation) {
        this.logger.debug(`Reverso ${from}->${to}: no translation`);
        return null;
      }
      this.logger.debug(`Translation ${from}->${to} via Reverso`);
      return result.translation;
    } catch (err) {
      this.logger.debug(`Reverso error ${from}->${to}`, err as Error);
      return null;
    }
  }

  private async translateMyMemory(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    try {
      const url = new URL(runtime.myMemoryUrl);
      url.searchParams.set('q', text);
      url.searchParams.set('langpair', `${from}|${to}`);
      if (runtime.apiEmail?.trim()) url.searchParams.set('de', runtime.apiEmail.trim());

      const response = await fetch(url.toString());
      if (!response.ok) {
        this.logger.debug(`MyMemory ${from}->${to}: HTTP ${response.status}`);
        return null;
      }
      const data = (await response.json()) as MyMemoryResponse;
      if (data.responseStatus !== 200) {
        this.logger.debug(`MyMemory ${from}->${to}: status ${data.responseStatus}`);
        return null;
      }
      const translated = data.responseData?.translatedText?.trim();
      if (!translated || MYMEMORY_WARNING.test(translated)) return null;
      this.logger.debug(`Translation ${from}->${to} via MyMemory`);
      return translated;
    } catch (err) {
      this.logger.warn(`MyMemory error ${from}->${to}`, err as Error);
      return null;
    }
  }

  private async translateLibre(
    text: string,
    from: string,
    to: string,
    runtime: ReturnType<typeof getPlatformIntegrationRuntime>['translation'],
  ): Promise<string | null> {
    if (!runtime.libreTranslateUrl) return null;
    try {
      const response = await fetch(runtime.libreTranslateUrl.replace(/\/$/, '') + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text',
          ...(runtime.libreTranslateApiKey ? { api_key: runtime.libreTranslateApiKey } : {}),
        }),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { translatedText?: string };
      const translated = data.translatedText?.trim();
      if (translated && !MYMEMORY_WARNING.test(translated)) {
        this.logger.debug(`Translation ${from}->${to} via LibreTranslate`);
        return translated;
      }
      return null;
    } catch (err) {
      this.logger.debug(`LibreTranslate error ${from}->${to}`, err as Error);
      return null;
    }
  }

  private async translateGoogleGtx(text: string, from: string, to: string): Promise<string | null> {
    try {
      const url = new URL('https://translate.googleapis.com/translate_a/single');
      url.searchParams.set('client', 'gtx');
      url.searchParams.set('sl', from);
      url.searchParams.set('tl', to);
      url.searchParams.set('dt', 't');
      url.searchParams.set('q', text);

      const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'Arvilio/1.0' },
      });
      if (!response.ok) return null;

      const data = (await response.json()) as unknown;
      const translated = extractGtxTranslation(data);
      return translated && !MYMEMORY_WARNING.test(translated) ? translated : null;
    } catch (err) {
      this.logger.debug(`GTX translation error ${from}->${to}`, err as Error);
      return null;
    }
  }
}

function extractGtxTranslation(data: unknown): string | null {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
  const parts: string[] = [];
  for (const segment of data[0]) {
    if (Array.isArray(segment) && typeof segment[0] === 'string' && segment[0].trim()) {
      parts.push(segment[0].trim());
    }
  }
  const joined = parts.join('').trim();
  return joined || null;
}
