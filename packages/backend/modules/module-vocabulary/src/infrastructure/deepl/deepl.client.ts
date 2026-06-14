import { Logger } from '@nestjs/common';

const logger = new Logger('DeepLClient');

export const DEFAULT_DEEPL_API_URL = 'https://api-free.deepl.com';

export type DeepLTranslateOptions = {
  apiUrl: string;
  authKey: string;
};

type DeepLTranslateResponse = {
  translations?: Array<{ text?: string }>;
};

export async function deeplTranslate(
  text: string,
  fromIso: string,
  toIso: string,
  options: DeepLTranslateOptions,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || !options.authKey?.trim()) return null;

  const base = (options.apiUrl?.trim() || DEFAULT_DEEPL_API_URL).replace(/\/$/, '');
  const url = `${base}/v2/translate`;

  try {
    const body = new URLSearchParams();
    body.set('text', trimmed);
    body.set('target_lang', toIso.toUpperCase());
    if (fromIso.trim()) body.set('source_lang', fromIso.toUpperCase());

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${options.authKey.trim()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      logger.debug(`DeepL HTTP ${response.status} for ${fromIso}->${toIso}`);
      return null;
    }

    const data = (await response.json()) as DeepLTranslateResponse;
    const translated = data.translations?.[0]?.text?.trim();
    return translated || null;
  } catch (err) {
    logger.debug(`DeepL error ${fromIso}->${toIso}`, err as Error);
    return null;
  }
}
