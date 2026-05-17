import type { WordDefinitionDto } from '@soenglish/shared-types';
import { stripHtml } from './strip-html';

/** Non-empty gloss, not a placeholder dash. */
export function isUsableGloss(text?: string | null, lemmaText?: string | null): boolean {
  const check = (value?: string | null) => {
    const t = value?.trim();
    return Boolean(t && t !== '—' && t !== '-');
  };
  return check(text) || check(lemmaText);
}

/** Best display string for a definition row (translated definition, else translated lemma). */
export function glossFromDefinition(d: WordDefinitionDto): string | null {
  if (isUsableGloss(d.text)) return stripHtml(d.text!);
  if (isUsableGloss(d.lemmaText)) return stripHtml(d.lemmaText!);
  return null;
}

/** Word translation gloss — lemma first, then definition text as fallback. */
export function translationFromDefinition(d: WordDefinitionDto): string | null {
  if (isUsableGloss(d.lemmaText)) return stripHtml(d.lemmaText!);
  if (isUsableGloss(d.text)) return stripHtml(d.text!);
  return null;
}

/** Pick localized definition: native → English → first available. */
export function pickWordDefinition(
  definitions: WordDefinitionDto[] | undefined,
  nativeLanguageId: string | null | undefined,
  englishLanguageId: string | null | undefined,
  fallbackDefinition: string,
): string {
  if (!definitions?.length) return fallbackDefinition;

  if (nativeLanguageId) {
    const nativeRows = definitions.filter((d) => d.languageId === nativeLanguageId);
    const ordered = [
      ...nativeRows.filter((d) => !d.partOfSpeech?.trim()),
      ...nativeRows.filter((d) => d.partOfSpeech?.trim()),
    ];
    for (const row of ordered) {
      const gloss = glossFromDefinition(row);
      if (gloss) return gloss;
    }
  }

  if (englishLanguageId) {
    const enRows = definitions.filter((d) => d.languageId === englishLanguageId);
    for (const row of enRows) {
      const gloss = glossFromDefinition(row);
      if (gloss) return gloss;
    }
  }

  for (const row of definitions) {
    const gloss = glossFromDefinition(row);
    if (gloss) return gloss;
  }

  return fallbackDefinition;
}

/** Pick localized word translation (lemma), not the full definition gloss. */
export function pickWordTranslation(
  definitions: WordDefinitionDto[] | undefined,
  nativeLanguageId: string | null | undefined,
  englishLanguageId: string | null | undefined,
): string {
  if (!definitions?.length) return '';

  const pickFromRows = (rows: WordDefinitionDto[]) => {
    const ordered = [
      ...rows.filter((d) => !d.partOfSpeech?.trim()),
      ...rows.filter((d) => d.partOfSpeech?.trim()),
    ];
    for (const row of ordered) {
      const gloss = translationFromDefinition(row);
      if (gloss) return gloss;
    }
    return '';
  };

  if (nativeLanguageId && nativeLanguageId !== englishLanguageId) {
    const native = pickFromRows(definitions.filter((d) => d.languageId === nativeLanguageId));
    if (native) return native;
  }

  for (const row of definitions) {
    const gloss = translationFromDefinition(row);
    if (gloss) return gloss;
  }

  return '';
}

/** Native-language rows with usable gloss, sorted by part of speech. */
export function pickNativeDefinitions(
  definitions: WordDefinitionDto[],
  nativeLanguageId: string | null | undefined,
  englishLanguageId: string | undefined,
): WordDefinitionDto[] {
  if (!nativeLanguageId || nativeLanguageId === englishLanguageId) return [];

  const posRank = (pos?: string) => {
    const order: Record<string, number> = { noun: 0, verb: 1, adjective: 2, adverb: 3 };
    return order[pos?.toLowerCase() ?? ''] ?? 50;
  };

  return definitions
    .filter((d) => d.languageId === nativeLanguageId && isUsableGloss(d.text, d.lemmaText))
    .sort((a, b) => posRank(a.partOfSpeech) - posRank(b.partOfSpeech));
}
