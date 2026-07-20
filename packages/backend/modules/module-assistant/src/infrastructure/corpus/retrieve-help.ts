import {
  ASSISTANT_CORPUS,
  type AssistantAudience,
  type AssistantCorpusChunk,
} from './assistant-corpus';

/** Map membership / legacy role to corpus audience. */
export function roleToAudience(role: string | null | undefined): AssistantAudience {
  const r = (role ?? 'STUDENT').toUpperCase();
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'admin';
  if (r === 'TEACHER') return 'teacher';
  return 'student';
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]/gu, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

/**
 * Role ACL: user sees a chunk when their audience is listed on the chunk.
 * e.g. audience `['teacher','admin']` → teachers and admins; not students.
 */
export function visibleChunks(
  audience: AssistantAudience,
  corpus: AssistantCorpusChunk[] = ASSISTANT_CORPUS,
): AssistantCorpusChunk[] {
  return corpus.filter((chunk) => chunk.audience.includes(audience));
}

export type RetrievedChunk = AssistantCorpusChunk & { score: number };

/**
 * Lightweight keyword FTS — no embeddings. Returns top-k scored chunks.
 */
export function retrieveHelpChunks(
  query: string,
  audience: AssistantAudience,
  limit = 5,
  corpus: AssistantCorpusChunk[] = ASSISTANT_CORPUS,
): RetrievedChunk[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const pool = visibleChunks(audience, corpus);
  const scored: RetrievedChunk[] = [];

  for (const chunk of pool) {
    const hay = tokenize(
      `${chunk.title} ${chunk.body} ${chunk.keywords.join(' ')} ${chunk.navHref ?? ''}`,
    );
    let score = 0;
    for (const t of tokens) {
      if (hay.includes(t)) score += 2;
      else if (hay.some(h => h.includes(t) || t.includes(h))) score += 1;
    }
    for (const kw of chunk.keywords) {
      if (tokens.includes(kw.toLowerCase())) score += 3;
    }
    if (score > 0) scored.push({ ...chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function formatChunksForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return 'No matching help articles. Say you are unsure and suggest the Header ? help or Profile.';
  }
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] ${c.title}${c.navHref ? ` (${c.navHref})` : ''}\n${c.body}`,
    )
    .join('\n\n');
}
