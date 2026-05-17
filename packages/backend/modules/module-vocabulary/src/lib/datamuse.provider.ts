import { Injectable, Logger } from '@nestjs/common';

export type DatamuseLookup = {
  definition: string | null;
  synonyms: string[];
  antonyms: string[];
  payload: unknown;
};

type DatamuseWord = {
  word?: string;
  defs?: string[];
  tags?: string[];
};

const DATAMUSE_API = 'https://api.datamuse.com/words';

@Injectable()
export class DatamuseProvider {
  private readonly logger = new Logger(DatamuseProvider.name);

  async lookup(rawText: string): Promise<DatamuseLookup | null> {
    const text = rawText.trim().toLowerCase();
    if (!text) return null;
    try {
      const [defsRes, synRes, antRes] = await Promise.all([
        fetch(`${DATAMUSE_API}?sp=${encodeURIComponent(text)}&md=d&max=1`),
        fetch(`${DATAMUSE_API}?rel_syn=${encodeURIComponent(text)}&max=10`),
        fetch(`${DATAMUSE_API}?rel_ant=${encodeURIComponent(text)}&max=10`),
      ]);

      const defsData = defsRes.ok ? ((await defsRes.json()) as DatamuseWord[]) : [];
      const synData = synRes.ok ? ((await synRes.json()) as DatamuseWord[]) : [];
      const antData = antRes.ok ? ((await antRes.json()) as DatamuseWord[]) : [];

      const exact = defsData.find((row) => row.word?.toLowerCase() === text) ?? defsData[0];
      const definition = exact?.defs?.[0]
        ? parseDatamuseDef(exact.defs[0])
        : null;

      return {
        definition,
        synonyms: synData.map((row) => row.word).filter((w): w is string => Boolean(w)),
        antonyms: antData.map((row) => row.word).filter((w): w is string => Boolean(w)),
        payload: { defs: defsData, synonyms: synData, antonyms: antData },
      };
    } catch (err) {
      this.logger.debug(`Datamuse lookup failed for "${text}"`, err as Error);
      return null;
    }
  }
}

/** Datamuse def format: "n\tshort gloss" */
function parseDatamuseDef(raw: string): string | null {
  const parts = raw.split('\t');
  const gloss = (parts[1] ?? parts[0])?.trim();
  return gloss || null;
}
