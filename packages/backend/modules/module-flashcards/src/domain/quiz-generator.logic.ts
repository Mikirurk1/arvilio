/** Pure quiz helpers (unit-tested; imported by be-flashcards). */

export function encodeQuizCursor(row: { createdAt: Date; id: string }): string {
  return `${row.createdAt.toISOString()}|${row.id}`;
}

export function decodeQuizCursor(cursor: string): { createdAt: Date; id: string } {
  const parts = cursor.split('|');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid quiz cursor');
  }
  return { createdAt: new Date(parts[0]), id: parts[1] };
}

export function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function maskWordInExample(example: string, word: string): string | null {
  if (!example || !word) return null;
  const trimmed = word.trim();
  if (!trimmed) return null;
  if (trimmed.includes(' ')) {
    const phrasePattern = new RegExp(escapeRegex(trimmed), 'i');
    if (!phrasePattern.test(example)) return null;
    return example.replace(phrasePattern, '_____');
  }
  const pattern = new RegExp(`\\b${escapeRegex(trimmed)}\\b`, 'i');
  if (!pattern.test(example)) return null;
  return example.replace(pattern, '_____');
}
