import { PROFICIENCY_LEVEL, type ProficiencyLevelEntry } from '@pkg/types';

export const PROFICIENCY_LEVEL_OPTIONS: ProficiencyLevelEntry[] = Object.values(PROFICIENCY_LEVEL);

/** Map stored level string to a canonical CEFR code, or empty when unset/unknown. */
export function normalizeProficiencyLevelCode(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return '';

  for (const entry of PROFICIENCY_LEVEL_OPTIONS) {
    if (entry.code.toLowerCase() === trimmed.toLowerCase()) return entry.code;
    if (entry.label.toLowerCase() === trimmed.toLowerCase()) return entry.code;
  }

  const upper = trimmed.toUpperCase();
  if (/^(A1|A2|B1|B2|C1|C2)$/.test(upper)) return upper;

  return '';
}

export function getProficiencyLevelByCode(
  code: string | null | undefined,
): ProficiencyLevelEntry | undefined {
  const normalized = normalizeProficiencyLevelCode(code);
  if (!normalized) return undefined;
  return PROFICIENCY_LEVEL_OPTIONS.find((entry) => entry.code === normalized);
}

export function formatProficiencyLevelLabel(code: string | null | undefined): string | null {
  const entry = getProficiencyLevelByCode(code);
  if (entry) return `${entry.code} — ${entry.label}`;
  const trimmed = code?.trim();
  return trimmed || null;
}

export function formatProficiencyLevelShort(code: string | null | undefined): string | null {
  const entry = getProficiencyLevelByCode(code);
  if (entry) return entry.code;
  const trimmed = code?.trim();
  return trimmed || null;
}
