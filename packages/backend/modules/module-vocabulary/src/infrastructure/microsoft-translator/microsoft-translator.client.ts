import { Logger } from '@nestjs/common';

const logger = new Logger('MicrosoftTranslatorClient');

export const DEFAULT_AZURE_TRANSLATOR_URL = 'https://api.cognitive.microsofttranslator.com';

export type MicrosoftTranslatorOptions = {
  apiUrl: string;
  subscriptionKey: string;
  region: string;
};

type MicrosoftTranslateResponse = Array<{ translations?: Array<{ text?: string }> }>;

export async function microsoftTranslate(
  text: string,
  fromIso: string,
  toIso: string,
  options: MicrosoftTranslatorOptions,
): Promise<string | null> {
  const trimmed = text.trim();
  const key = options.subscriptionKey?.trim();
  const region = options.region?.trim();
  if (!trimmed || !key || !region) return null;

  const base = (options.apiUrl?.trim() || DEFAULT_AZURE_TRANSLATOR_URL).replace(/\/$/, '');
  const url = new URL(`${base}/translate`);
  url.searchParams.set('api-version', '3.0');
  url.searchParams.set('from', fromIso);
  url.searchParams.set('to', toIso);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': key,
        'Ocp-Apim-Subscription-Region': region,
      },
      body: JSON.stringify([{ text: trimmed }]),
    });

    if (!response.ok) {
      logger.debug(`Microsoft Translator HTTP ${response.status} for ${fromIso}->${toIso}`);
      return null;
    }

    const data = (await response.json()) as MicrosoftTranslateResponse;
    const translated = data[0]?.translations?.[0]?.text?.trim();
    return translated || null;
  } catch (err) {
    logger.debug(`Microsoft Translator error ${fromIso}->${toIso}`, err as Error);
    return null;
  }
}
