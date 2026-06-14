/** Trim and collapse internal whitespace for a single tag label. */
export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function tagKey(tag: string): string {
  return normalizeTag(tag).toLowerCase();
}

export function isDuplicateTag(tag: string, tags: string[]): boolean {
  const key = tagKey(tag);
  if (!key) return true;
  return tags.some((existing) => tagKey(existing) === key);
}

/** Split pasted or typed text into unique new tags (preserves first-seen casing). */
export function parseTagsFromText(text: string, existing: string[] = []): string[] {
  const next = [...existing];
  const parts = text.split(/[,;\n]+/);
  for (const part of parts) {
    const normalized = normalizeTag(part);
    if (!normalized || isDuplicateTag(normalized, next)) continue;
    next.push(normalized);
  }
  return next;
}

export function addTag(tags: string[], raw: string): string[] {
  const normalized = normalizeTag(raw);
  if (!normalized || isDuplicateTag(normalized, tags)) return tags;
  return [...tags, normalized];
}

export function removeTag(tags: string[], tag: string): string[] {
  const key = tagKey(tag);
  return tags.filter((item) => tagKey(item) !== key);
}

export function collectUniqueTags(lists: string[][]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const list of lists) {
    for (const tag of list) {
      const normalized = normalizeTag(tag);
      const key = tagKey(normalized);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(normalized);
    }
  }
  return result.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function filterTagSuggestions(
  suggestions: string[],
  selected: string[],
  draft: string,
): string[] {
  const draftKey = tagKey(draft);
  return suggestions.filter((tag) => {
    if (isDuplicateTag(tag, selected)) return false;
    if (!draftKey) return true;
    return tagKey(tag).includes(draftKey);
  });
}
