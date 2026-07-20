import type { WordDefinitionDto } from '@pkg/types';
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

function normalizePosKey(pos?: string | null): string {
  return pos?.trim().toLowerCase() ?? '';
}

function isPosFilterActive(partOfSpeechFilter?: string | null): partOfSpeechFilter is string {
  return Boolean(partOfSpeechFilter && partOfSpeechFilter !== 'All');
}

/** Rows for a specific POS, else untagged rows when none match. */
export function filterDefinitionRowsByPos(
  rows: WordDefinitionDto[],
  partOfSpeech: string,
): WordDefinitionDto[] {
  const key = normalizePosKey(partOfSpeech);
  const matching = rows.filter((row) => normalizePosKey(row.partOfSpeech) === key);
  if (matching.length > 0) return matching;
  return rows.filter((row) => !row.partOfSpeech?.trim());
}

/** Pick localized definition: native → English → first available. */
export function pickWordDefinition(
  definitions: WordDefinitionDto[] | undefined,
  nativeLanguageId: string | null | undefined,
  englishLanguageId: string | null | undefined,
  fallbackDefinition: string,
  partOfSpeechFilter?: string | null,
): string {
  if (!definitions?.length) return fallbackDefinition;

  const usePos = isPosFilterActive(partOfSpeechFilter);

  if (nativeLanguageId) {
    let nativeRows = definitions.filter((d) => d.languageId === nativeLanguageId);
    if (usePos) nativeRows = filterDefinitionRowsByPos(nativeRows, partOfSpeechFilter);
    const ordered = usePos
      ? nativeRows
      : [
          ...nativeRows.filter((d) => !d.partOfSpeech?.trim()),
          ...nativeRows.filter((d) => d.partOfSpeech?.trim()),
        ];
    for (const row of ordered) {
      const gloss = glossFromDefinition(row);
      if (gloss) return gloss;
    }
  }

  if (englishLanguageId) {
    let enRows = definitions.filter((d) => d.languageId === englishLanguageId);
    if (usePos) enRows = filterDefinitionRowsByPos(enRows, partOfSpeechFilter);
    for (const row of enRows) {
      const gloss = glossFromDefinition(row);
      if (gloss) return gloss;
    }
  }

  const fallbackRows = usePos
    ? filterDefinitionRowsByPos(definitions, partOfSpeechFilter)
    : definitions;
  for (const row of fallbackRows) {
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
  partOfSpeechFilter?: string | null,
): string {
  if (!definitions?.length) return '';

  const usePos = isPosFilterActive(partOfSpeechFilter);

  const pickFromRows = (rows: WordDefinitionDto[]) => {
    const scoped = usePos ? filterDefinitionRowsByPos(rows, partOfSpeechFilter) : rows;
    const ordered = usePos
      ? scoped
      : [
          ...scoped.filter((d) => !d.partOfSpeech?.trim()),
          ...scoped.filter((d) => d.partOfSpeech?.trim()),
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

  const fallbackRows = usePos
    ? filterDefinitionRowsByPos(definitions, partOfSpeechFilter)
    : definitions;
  for (const row of fallbackRows) {
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
  partOfSpeechFilter?: string | null,
): WordDefinitionDto[] {
  if (!nativeLanguageId || nativeLanguageId === englishLanguageId) return [];

  const posRank = (pos?: string) => {
    const order: Record<string, number> = { noun: 0, verb: 1, adjective: 2, adverb: 3 };
    return order[pos?.toLowerCase() ?? ''] ?? 50;
  };

  let rows = definitions.filter(
    (d) => d.languageId === nativeLanguageId && isUsableGloss(d.text, d.lemmaText),
  );
  if (isPosFilterActive(partOfSpeechFilter)) {
    rows = filterDefinitionRowsByPos(rows, partOfSpeechFilter);
  }

  return rows.sort((a, b) => posRank(a.partOfSpeech) - posRank(b.partOfSpeech));
}
