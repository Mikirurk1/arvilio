/** ISO 639-1 (lowercase) → Reverso translate API language codes. */
export const ISO_TO_REVERSO: Record<string, string> = {
  ar: 'ara',
  de: 'ger',
  en: 'eng',
  es: 'spa',
  fr: 'fra',
  he: 'heb',
  it: 'ita',
  ja: 'jpn',
  nl: 'dut',
  pl: 'pol',
  pt: 'por',
  ro: 'rum',
  ru: 'rus',
  tr: 'tur',
  uk: 'ukr',
  zh: 'chi',
};

export function toReversoLanguageCode(iso6391: string): string | null {
  const code = iso6391.trim().toLowerCase();
  return ISO_TO_REVERSO[code] ?? null;
}

export function reversoPairSupported(fromIso: string, toIso: string): boolean {
  return Boolean(toReversoLanguageCode(fromIso) && toReversoLanguageCode(toIso));
}
