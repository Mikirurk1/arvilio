import { Logger } from '@nestjs/common';

const logger = new Logger('GoogleTranslateClient');

export const DEFAULT_GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com';

export type GoogleTranslateOptions = {
  apiUrl: string;
  apiKey: string;
};

type GoogleTranslateResponse = {
  data?: { translations?: Array<{ translatedText?: string }> };
};

export async function googleCloudTranslate(
  text: string,
  fromIso: string,
  toIso: string,
  options: GoogleTranslateOptions,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || !options.apiKey?.trim()) return null;

  const base = (options.apiUrl?.trim() || DEFAULT_GOOGLE_TRANSLATE_API_URL).replace(/\/$/, '');
  const url = new URL(`${base}/language/translate/v2`);
  url.searchParams.set('key', options.apiKey.trim());

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: trimmed,
        source: fromIso,
        target: toIso,
        format: 'text',
      }),
    });

    if (!response.ok) {
      logger.debug(`Google Translate HTTP ${response.status} for ${fromIso}->${toIso}`);
      return null;
    }

    const data = (await response.json()) as GoogleTranslateResponse;
    const translated = data.data?.translations?.[0]?.translatedText?.trim();
    return translated || null;
  } catch (err) {
    logger.debug(`Google Translate error ${fromIso}->${toIso}`, err as Error);
    return null;
  }
}
