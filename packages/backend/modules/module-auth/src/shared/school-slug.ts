/**
 * Slugify a school name into a URL-safe subdomain candidate (Phase 4.5.1).
 * Lowercase, ASCII-ish, hyphen-separated; collapses runs and trims hyphens.
 * Falls back to "school" when nothing usable remains.
 */
export function slugifySchoolName(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  return slug || 'school';
}

/** Short random suffix to de-collide slugs. */
export function randomSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}
