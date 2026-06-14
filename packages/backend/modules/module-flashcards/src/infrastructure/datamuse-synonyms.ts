const DATAMUSE_API = 'https://api.datamuse.com/words';

type DatamuseWord = { word?: string };

/** Free Datamuse API — related English lemmas for distractor hints. */
export async function fetchDatamuseSynonyms(lemma: string, max = 12): Promise<string[]> {
  const text = lemma.trim().toLowerCase();
  if (!text) return [];
  try {
    const response = await fetch(
      `${DATAMUSE_API}?rel_syn=${encodeURIComponent(text)}&max=${max}`,
    );
    if (!response.ok) return [];
    const data = (await response.json()) as DatamuseWord[];
    return data
      .map((row) => row.word?.trim())
      .filter((w): w is string => Boolean(w && w.toLowerCase() !== text));
  } catch {
    return [];
  }
}
