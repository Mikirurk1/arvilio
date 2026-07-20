export type AssistantRole = 'student' | 'teacher' | 'admin';

/**
 * Role-scoped product help policy for Arvi.
 * Corpus ACL already hides chunks; this layer shapes the prompt, NAVIGATE allowlist,
 * and refusal copy so the model cannot “helpfully” leak other roles’ surfaces.
 */

/** Paths Arvi may emit as NAVIGATE for each role (prefix match allowed). */
export const ROLE_NAV_ALLOWLIST: Record<AssistantRole, readonly string[]> = {
  student: [
    '/dashboard',
    '/calendar',
    '/practice',
    '/vocabulary',
    '/chat',
    '/profile',
    '/payment',
  ],
  teacher: [
    '/dashboard',
    '/calendar',
    '/practice',
    '/vocabulary',
    '/chat',
    '/profile',
    '/materials',
    '/students',
  ],
  admin: [
    '/dashboard',
    '/calendar',
    '/practice',
    '/vocabulary',
    '/chat',
    '/profile',
    '/payment',
    '/materials',
    '/students',
    '/finance',
    '/system',
    '/billing',
    '/admin',
    '/staff',
  ],
};

export function normalizeNavPath(path: string): string {
  const bare = path.trim().split('?')[0]?.split('#')[0] ?? '';
  if (!bare.startsWith('/')) return '';
  if (bare.length > 1 && bare.endsWith('/')) return bare.slice(0, -1);
  return bare;
}

export function isNavAllowedForRole(role: AssistantRole, path: string): boolean {
  const normalized = normalizeNavPath(path);
  if (!normalized || !/^\/[a-z0-9/_-]*$/i.test(normalized)) return false;
  return ROLE_NAV_ALLOWLIST[role].some(
    (allowed) => normalized === allowed || normalized.startsWith(`${allowed}/`),
  );
}

/** Extra system-prompt lines after the shared Arvi rules. */
export function rolePolicyPrompt(role: AssistantRole): string {
  switch (role) {
    case 'student':
      return [
        'ROLE POLICY — student:',
        '- You MAY: explain student UI (Dashboard, Calendar, Practice, Vocabulary, Chat, Payment, Profile); suggest NAVIGATE only to those areas.',
        '- You MUST NOT: solve homework/quizzes/speaking tests; discuss other students; explain Finance, System, Billing, Materials library admin, or staff payouts.',
        '- If they ask about teacher/admin tools, say those screens are for school staff and offer a student alternative (e.g. Payment instead of Finance).',
        '- Never invent balances, grades, or lesson counts — only describe where the UI shows them.',
      ].join('\n');
    case 'teacher':
      return [
        'ROLE POLICY — teacher:',
        '- You MAY: explain teaching workflows (Calendar scheduling, lesson room, Materials library, Students, Vocabulary/dictionary, Chat, Profile).',
        '- You MAY: give short product facts about Materials — upload/organize, attach to lessons, boards/books/media, who sees what — grounded in RETRIEVED HELP.',
        '- You MAY: translate or explain short Campus UI labels and help phrases (EN↔UK). Do NOT translate a student’s homework/quiz text.',
        '- You MAY: explain how to assign homework/quizzes in the product UI (where buttons live) — never the academic answers themselves.',
        '- You MUST NOT: give student homework/quiz/exercise keys or model speaking answers; invent student grades or attendance.',
        '- You MUST NOT: guide through school Finance ledgers, System secrets (API keys, Stripe), or Billing/subscription changes — those are admin-only; suggest asking an admin.',
        '- NAVIGATE only to teacher-allowed routes (no /finance, /system, /billing).',
      ].join('\n');
    case 'admin':
      return [
        'ROLE POLICY — school admin:',
        '- You MAY: explain school operations UI — Finance, System, Billing, Students, Materials, Staff, and shared screens.',
        '- You MAY: give short product facts about Materials and lessons (library, attach to lessons, formats) from RETRIEVED HELP.',
        '- You MAY: translate or explain short Campus UI labels and help phrases (EN↔UK). Do NOT translate student homework/quiz text.',
        '- You MAY: describe where secrets are configured, but NEVER ask for, repeat, or invent API keys, tokens, or passwords.',
        '- You MUST NOT: solve student homework/quizzes; invent live ledger balances, payout amounts, or other school PII.',
        '- Prefer NAVIGATE to the relevant admin screen; keep answers operational and helpful.',
      ].join('\n');
  }
}

export function academicRefusalForRole(role: AssistantRole): string {
  switch (role) {
    case 'student':
      return "I can help you navigate Campus, but I won't give answers to homework, quizzes, or exercises. Open your lesson materials or ask your teacher — or tell me which screen you need.";
    case 'teacher':
      return "I won't solve a student's homework, quiz, or exercise. I can help you find where to assign materials, open the lesson room, or manage Students — tell me which screen you need.";
    case 'admin':
      return "I won't provide homework or quiz answers. I can help with school product navigation (System, Finance, Billing, Students) — tell me which screen you need.";
  }
}

export function jailbreakRefusalForRole(_role: AssistantRole): string {
  return "I can only help with Campus product navigation for your role. I can't change my safety rules.";
}
