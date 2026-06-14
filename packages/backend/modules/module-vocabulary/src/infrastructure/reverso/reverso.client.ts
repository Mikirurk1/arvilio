import { Logger } from '@nestjs/common';
import { toReversoLanguageCode } from './reverso-language-codes';

export const DEFAULT_REVERSO_TRANSLATE_URL = 'https://api.reverso.net/translate/v1/translation';

export type ReversoTranslateOptions = {
  apiUrl: string;
  apiKey?: string | null;
  contextResults?: boolean;
  userAgent?: string;
};

export type ReversoContextExample = {
  source: string;
  target: string;
};

export type ReversoTranslateResult = {
  translation: string;
  translations: string[];
  examples: ReversoContextExample[];
  detectedLanguage: string | null;
};

type ReversoTranslateResponse = {
  translation?: string[];
  languageDetection?: { detectedLanguage?: string };
  contextResults?: {
    results?: Array<{
      translation?: string;
      sourceExamples?: string[];
      targetExamples?: string[];
      rude?: boolean;
    }>;
  };
};

const logger = new Logger('ReversoClient');

const CLOUDFLARE_MARKERS = /just a moment|cloudflare|cf-browser-verification/i;

export async function reversoTranslate(
  text: string,
  fromIso: string,
  toIso: string,
  options: ReversoTranslateOptions,
): Promise<ReversoTranslateResult | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const from = toReversoLanguageCode(fromIso);
  const to = toReversoLanguageCode(toIso);
  if (!from || !to) {
    logger.debug(`Reverso unsupported language pair ${fromIso}->${toIso}`);
    return null;
  }

  const url = (options.apiUrl?.trim() || DEFAULT_REVERSO_TRANSLATE_URL).replace(/\/$/, '');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent':
        options.userAgent?.trim() ||
        'Mozilla/5.0 (compatible; SoEnglish/1.0; +https://github.com/soenglish)',
      Origin: 'https://www.reverso.net',
      Referer: 'https://www.reverso.net/',
    };
    if (options.apiKey?.trim()) {
      headers.Authorization = `Bearer ${options.apiKey.trim()}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        format: 'text',
        from,
        to,
        input: trimmed,
        options: {
          contextResults: options.contextResults !== false,
          languageDetection: true,
          origin: 'reversomobile',
          sentenceSplitter: false,
        },
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      logger.debug(`Reverso HTTP ${response.status} for ${fromIso}->${toIso}`);
      return null;
    }
    if (CLOUDFLARE_MARKERS.test(raw)) {
      logger.warn(
        `Reverso blocked by Cloudflare for ${fromIso}->${toIso}. Use a corporate API key or server IP allowlist.`,
      );
      return null;
    }

    let data: ReversoTranslateResponse;
    try {
      data = JSON.parse(raw) as ReversoTranslateResponse;
    } catch {
      logger.debug(`Reverso invalid JSON for ${fromIso}->${toIso}`);
      return null;
    }

    const primary = data.translation?.find((row) => row?.trim())?.trim();
    if (!primary) return null;

    const extraFromContext =
      data.contextResults?.results
        ?.map((row) => row.translation?.trim())
        .filter((row): row is string => Boolean(row)) ?? [];

    const examples: ReversoContextExample[] = [];
    const firstContext = data.contextResults?.results?.[0];
    if (firstContext?.sourceExamples?.length && firstContext.targetExamples?.length) {
      const limit = Math.min(firstContext.sourceExamples.length, firstContext.targetExamples.length, 5);
      for (let i = 0; i < limit; i += 1) {
        const source = stripHtml(firstContext.sourceExamples[i] ?? '').trim();
        const target = stripHtml(firstContext.targetExamples[i] ?? '').trim();
        if (source && target) examples.push({ source, target });
      }
    }

    const translations = dedupe([primary, ...extraFromContext, ...(data.translation ?? [])]);

    return {
      translation: primary,
      translations,
      examples,
      detectedLanguage: data.languageDetection?.detectedLanguage?.trim() || null,
    };
  } catch (err) {
    logger.warn(`Reverso error ${fromIso}->${toIso}`, err as Error);
    return null;
  }
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = item?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}
