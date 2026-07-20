import {
  isNavAllowedForRole,
  rolePolicyPrompt,
  type AssistantRole,
} from './role-policy';

export type { AssistantRole } from './role-policy';

export function buildSystemPrompt(opts: {
  role: AssistantRole;
  pathname?: string | null;
  locale?: string | null;
  retrievedDocs: string;
}): string {
  const locale = opts.locale === 'uk' ? 'uk' : 'en';
  const allowedNav = (
    {
      student: '/dashboard, /calendar, /practice, /vocabulary, /chat, /profile, /payment',
      teacher:
        '/dashboard, /calendar, /practice, /vocabulary, /chat, /profile, /materials, /students',
      admin:
        '/dashboard, /calendar, /practice, /vocabulary, /chat, /profile, /payment, /materials, /students, /finance, /system, /billing, /admin, /staff',
    } as const
  )[opts.role];

  return [
    'You are Arvi, the Arvilio campus product guide (mascot assistant).',
    'Help users navigate the school product UI and explain features briefly for THEIR ROLE only.',
    'Ground product facts in the RETRIEVED HELP below. If docs are missing, say you are unsure and suggest Header ? help — but you may still give short, cautious UI tips that match common Campus screens for this role.',
    'Never invent school data, balances, other users, or secrets.',
    'Never provide homework, quiz, exercise, or speaking-test answers / keys, and never translate those assignments for learners.',
    'You MAY translate or gloss short Campus UI labels / menu names / help phrases (especially EN↔UK) for teachers and admins. Refuse translating a student’s homework or quiz text.',
    'You MAY answer light factual questions about product features (e.g. Materials library, attaching files to lessons) when helpful.',
    'If asked for academic answers to graded work, refuse and redirect appropriately.',
    'Keep replies short (2–5 sentences). Prefer suggesting a path like /calendar over long essays.',
    'When a deep link helps, end with a line: NAVIGATE: /path',
    `Only use NAVIGATE paths from this allowlist for the current role: ${allowedNav}. Never invent other routes.`,
    `User role: ${opts.role}.`,
    rolePolicyPrompt(opts.role),
    opts.pathname ? `User is currently on: ${opts.pathname}` : '',
    `Reply language: ${locale === 'uk' ? 'Ukrainian' : 'English'} unless the user writes otherwise.`,
    '',
    'RETRIEVED HELP:',
    opts.retrievedDocs,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Extract optional NAVIGATE: /path from model output (optionally role-gated). */
export function extractNavigate(
  text: string,
  role?: AssistantRole,
): string | null {
  const match = text.match(/NAVIGATE:\s*(\/[a-z0-9/_-]*)/i);
  if (!match?.[1]) return null;
  const path = match[1];
  if (!/^\/[a-z0-9/_-]*$/i.test(path)) return null;
  if (role && !isNavAllowedForRole(role, path)) return null;
  return path;
}

export function stripNavigateMarker(text: string): string {
  return text.replace(/\n?NAVIGATE:\s*\/[a-z0-9/_-]*/gi, '').trim();
}
