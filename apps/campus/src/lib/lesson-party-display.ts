/** Resolve lesson party label from hydrated map, stored lesson fields, or fallback. */
export function resolveLessonPartyLabel(
  numericId: number,
  storedName: string | undefined,
  nameByNumericId: Map<number, string>,
  fallback = '—',
): string {
  const fromMap = nameByNumericId.get(numericId)?.trim();
  if (fromMap) return fromMap;
  const fromStored = storedName?.trim();
  if (fromStored) return fromStored;
  return fallback;
}
