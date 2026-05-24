import { Injectable, Logger } from '@nestjs/common';

type MyMemoryResponse = {
  responseData?: { translatedText?: string };
  responseStatus?: number;
  responseDetails?: string;
};

const MYMEMORY_WARNING = /MYMEMORY WARNING|QUOTA|USAGE LIMIT/i;

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly myMemoryUrl =
    process.env['TRANSLATION_API_URL'] ?? 'https://api.mymemory.translated.net/get';
  private readonly libreTranslateUrl = process.env['LIBRETRANSLATE_URL']?.trim() || null;
  private readonly libreTranslateKey = process.env['LIBRETRANSLATE_API_KEY']?.trim() || null;
  /** Unofficial fallback when MyMemory quota is exhausted (set to "false" to disable). */
  private readonly gtxFallbackEnabled = process.env['TRANSLATION_GTX_FALLBACK'] !== 'false';

  async translate(text: string, fromCode: string, toCode: string): Promise<string | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const from = fromCode.trim().toLowerCase();
    const to = toCode.trim().toLowerCase();
    if (from === to) return trimmed;

    const myMemory = await this.translateMyMemory(trimmed, from, to);
    if (myMemory) return myMemory;

    if (this.libreTranslateUrl) {
      const libre = await this.translateLibre(trimmed, from, to);
      if (libre) return libre;
    }

    if (this.gtxFallbackEnabled) {
      const gtx = await this.translateGoogleGtx(trimmed, from, to);
      if (gtx) {
        this.logger.debug(`Translation ${from}->${to} via GTX fallback`);
        return gtx;
      }
    }

    this.logger.warn(
      `Translation ${from}->${to} failed for all providers. Set TRANSLATION_API_EMAIL for higher MyMemory quota.`,
    );
    return null;
  }

  private async translateMyMemory(text: string, from: string, to: string): Promise<string | null> {
    try {
      const url = new URL(this.myMemoryUrl);
      url.searchParams.set('q', text);
      url.searchParams.set('langpair', `${from}|${to}`);
      const email = process.env['TRANSLATION_API_EMAIL'];
      if (email?.trim()) url.searchParams.set('de', email.trim());

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
      return translated;
    } catch (err) {
      this.logger.warn(`MyMemory error ${from}->${to}`, err as Error);
      return null;
    }
  }

  private async translateLibre(text: string, from: string, to: string): Promise<string | null> {
    if (!this.libreTranslateUrl) return null;
    try {
      const response = await fetch(this.libreTranslateUrl.replace(/\/$/, '') + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text',
          ...(this.libreTranslateKey ? { api_key: this.libreTranslateKey } : {}),
        }),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { translatedText?: string };
      const translated = data.translatedText?.trim();
      return translated && !MYMEMORY_WARNING.test(translated) ? translated : null;
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
        headers: { 'User-Agent': 'SoEnglish/1.0' },
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
