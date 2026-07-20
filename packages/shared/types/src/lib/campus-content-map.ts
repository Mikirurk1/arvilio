/**
 * Campus Content IA: page-scoped docs + Global chrome strings.
 * Keys stay full dotted paths (`dashboard.hero.title`); only CMS storage changes.
 */

/** Prefixes stored on Payload global `campus-global` (shared chrome). */
export const CAMPUS_GLOBAL_STRING_PREFIXES = [
  'nav',
  'header',
  'common',
  'a11y',
  'locale',
  'cookie',
  'notFound',
  'mascot',
  'tour',
  'status',
] as const;

export const CAMPUS_CONTENT_DEFAULT_SLUG = 'system' as const;

/**
 * First key segment → Content document slug (or `null` = Global).
 * Unknown prefixes → default Content slug `system`.
 */
const PREFIX_TO_CONTENT_SLUG: Record<string, string | null> = {
  // Global chrome
  nav: null,
  header: null,
  common: null,
  a11y: null,
  locale: null,
  cookie: null,
  notFound: null,
  mascot: null,
  tour: null,
  status: null,
  // Pages (URL-aligned where practical)
  dashboard: 'dashboard',
  stats: 'dashboard',
  login: 'login',
  signup: 'signup',
  forgot: 'forgot',
  reset: 'reset',
  lessons: 'lessons',
  lessonModal: 'lessons',
  lessonDetail: 'lessons',
  practice: 'practice',
  vocabulary: 'vocabulary',
  quiz: 'quiz',
  speaking: 'speaking',
  irregular: 'irregular',
  materials: 'materials',
  students: 'students',
  studentImport: 'students',
  staff: 'staff',
  staffPayout: 'staff',
  profile: 'profile',
  onboarding: 'profile',
  payment: 'payment',
  billing: 'billing',
  finance: 'finance',
  entitlements: 'system',
  offer: 'system',
  chat: 'chat',
  calendar: 'calendar',
  system: 'system',
  admin: 'system',
  legal: 'system',
  privacy: 'system',
};

export type CampusContentPlacement =
  | { kind: 'global' }
  | { kind: 'content'; slug: string };

/** Where a catalog/CMS key should live in the Content + Global IA. */
export function campusContentPlacementFromKey(key: string): CampusContentPlacement {
  const prefix = key.split('.')[0] ?? '';
  if (Object.prototype.hasOwnProperty.call(PREFIX_TO_CONTENT_SLUG, prefix)) {
    const slug = PREFIX_TO_CONTENT_SLUG[prefix];
    if (slug === null) return { kind: 'global' };
    return { kind: 'content', slug };
  }
  return { kind: 'content', slug: CAMPUS_CONTENT_DEFAULT_SLUG };
}

export function isCampusGlobalStringKey(key: string): boolean {
  return campusContentPlacementFromKey(key).kind === 'global';
}

export function campusContentSlugFromKey(key: string): string | null {
  const p = campusContentPlacementFromKey(key);
  return p.kind === 'content' ? p.slug : null;
}
