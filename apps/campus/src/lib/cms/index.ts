/** Client-safe Campus CMS helpers (no `next/headers` / server-only fetch). */
export type {
  CampusCmsPage,
  CampusNavItem,
  CampusNavSection,
  CampusTour,
  CampusTourStep,
} from './campus-cms';
export {
  formatCampusString,
  normalizeCampusLocale,
  resolveCampusLocale,
  tFromMap,
} from './campus-cms';
export { CampusI18nProvider, useCampusI18n, useCampusT } from './useCampusI18n';
export { buildCalendarSeriesCopy, buildLessonModalCopy } from './lesson-modal-copy';
export { lexicalToMarkdownSource } from './lexical-html';
export { mergeTourCopy } from './merge-tour-copy';
export { mapCampusNavToItems, useCampusNavSections } from './useCampusNav';
