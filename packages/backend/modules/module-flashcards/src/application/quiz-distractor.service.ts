import { Injectable } from '@nestjs/common';
import { fetchDatamuseSynonyms } from '../infrastructure/datamuse-synonyms';
import type { WordRow } from './quiz-generator.types';

@Injectable()
export class QuizDistractorService {
  /** Map target word id → synonym lemmas that exist in the student pool (by lemma text). */
  async synonymPoolRowsByWordId(
    targets: WordRow[],
    pool: WordRow[],
  ): Promise<Map<string, WordRow[]>> {
    const poolByLemma = new Map<string, WordRow>();
    for (const row of pool) {
      const key = row.text.trim().toLowerCase();
      if (!poolByLemma.has(key)) poolByLemma.set(key, row);
    }

    const out = new Map<string, WordRow[]>();
    await Promise.all(
      targets.map(async (target) => {
        const synonyms = await fetchDatamuseSynonyms(target.text, 15);
        const rows: WordRow[] = [];
        for (const syn of synonyms) {
          const match = poolByLemma.get(syn.toLowerCase());
          if (match && match.id !== target.id) rows.push(match);
        }
        if (rows.length > 0) out.set(target.id, rows);
      }),
    );
    return out;
  }
}
