import { stripLocalePrefix } from '@pkg/types';
import type { TourStep } from './tracks/types';

export type TourContextInput = {
  steps: TourStep[];
  pathname: string;
  /** Anchors found inside open dialogs (preferred when non-empty). */
  modalAnchorIds?: string[];
  /** Visible page anchors (optional; when omitted, only navHref + modal ids apply). */
  pageAnchorIds?: string[];
};

const EXCLUDED_SUFFIXES = ['-welcome', '-done'];

function isExcludedFromContextual(stepId: string): boolean {
  return EXCLUDED_SUFFIXES.some((suffix) => stepId.endsWith(suffix));
}

/** Normalize app path without locale prefix. */
export function normalizeTourPathname(pathname: string): string {
  const stripped = stripLocalePrefix(pathname || '/').pathname || '/';
  if (stripped.length > 1 && stripped.endsWith('/')) return stripped.slice(0, -1);
  return stripped || '/';
}

/**
 * Practice hub aliases → canonical Help paths.
 * Hub cards use `/practice/vocabulary` and `/practice/quiz`; Help catalogs use
 * `/vocabulary` and `/quiz`. Without this, those URLs match `/practice` hub tips.
 */
export function normalizeHelpPathname(pathname: string): string {
  const path = normalizeTourPathname(pathname);
  if (path === '/practice/vocabulary' || path.startsWith('/practice/vocabulary/')) {
    return '/vocabulary';
  }
  if (path === '/practice/quiz' || path.startsWith('/practice/quiz/')) {
    return '/quiz';
  }
  return path;
}

export function pathMatchesNavHref(pathname: string, navHref: string): boolean {
  const path = normalizeTourPathname(pathname);
  const href = normalizeTourPathname(navHref);
  if (path === href) return true;
  // Nested routes: /students/abc matches navHref /students
  if (href !== '/' && path.startsWith(`${href}/`)) return true;
  return false;
}

/** Path match for Help — uses practice→canonical aliases first. */
export function pathMatchesHelpNavHref(pathname: string, navHref: string): boolean {
  const path = normalizeHelpPathname(pathname);
  const href = normalizeHelpPathname(navHref);
  if (path === href) return true;
  if (href !== '/' && path.startsWith(`${href}/`)) return true;
  return false;
}

/**
 * Collect `data-tour-anchor` values from open dialogs (role=dialog).
 * Safe to call in browser only.
 */
export function collectOpenDialogAnchorIds(root: ParentNode = document): string[] {
  const dialogs = root.querySelectorAll('[role="dialog"]');
  const ids: string[] = [];
  dialogs.forEach((dialog) => {
    const el = dialog as HTMLElement;
    if (el.getAttribute('aria-hidden') === 'true') return;
    if (el.dataset.tourPhase != null) return; // skip ProductTour overlay itself
    // Prefer real modals (aria-modal) so cookie banners / sheets without anchors don't matter
    if (el.getAttribute('aria-modal') !== 'true') return;
    dialog.querySelectorAll('[data-tour-anchor]').forEach((node) => {
      const id = (node as HTMLElement).getAttribute('data-tour-anchor');
      if (id) ids.push(id);
    });
    const self = el.getAttribute('data-tour-anchor');
    if (self) ids.push(self);
  });
  return [...new Set(ids)];
}

/**
 * Collect visible `data-tour-anchor` values on the page (not inside dialogs).
 * Safe to call in browser only.
 */
export function collectVisiblePageAnchorIds(root: ParentNode = document): string[] {
  const ids: string[] = [];
  root.querySelectorAll('[data-tour-anchor]').forEach((node) => {
    const el = node as HTMLElement;
    if (el.closest('[role="dialog"]')) return;
    if (el.closest('[data-tour-phase]')) return;
    if (el.getAttribute('aria-hidden') === 'true' || el.hidden) return;
    const id = el.getAttribute('data-tour-anchor');
    if (id) ids.push(id);
  });
  return [...new Set(ids)];
}

/**
 * Filter Help encyclopedia for Header `?`.
 * Match by current page (`navHref`) with practice path aliases. Prefer the
 * **longest** matching `navHref` so `/practice/speaking` does not also walk
 * every `/practice` hub tip. When `pageAnchorIds` is provided, keep only tips
 * whose `anchorId` is currently visible (mode/phase-aware Vocabulary Help).
 * Modal anchors may narrow further when a real dialog is open.
 */
export function filterHelpStepsForPage(input: TourContextInput): TourStep[] {
  const { steps, pathname, modalAnchorIds = [], pageAnchorIds } = input;
  const candidates = steps.filter((s) => !isExcludedFromContextual(s.id));
  const matching = candidates.filter(
    (s) => Boolean(s.navHref) && pathMatchesHelpNavHref(pathname, s.navHref!),
  );
  if (matching.length === 0) {
    return [];
  }

  const bestLen = Math.max(
    ...matching.map((s) => normalizeHelpPathname(s.navHref!).length),
  );
  let onPage = matching.filter(
    (s) => normalizeHelpPathname(s.navHref!).length === bestLen,
  );

  if (pageAnchorIds != null && pageAnchorIds.length > 0) {
    const visible = new Set(pageAnchorIds);
    const visibleSteps = onPage.filter(
      (s) => s.anchorId == null || visible.has(s.anchorId),
    );
    // Only narrow when at least one anchored tip is on screen (avoids empty Help
    // if anchors failed to mount during a brief load).
    if (visibleSteps.some((s) => s.anchorId != null)) {
      onPage = visibleSteps;
    }
  }

  if (modalAnchorIds.length > 0) {
    const modalSet = new Set(modalAnchorIds);
    const modalSteps = onPage.filter(
      (s) => s.anchorId != null && modalSet.has(s.anchorId),
    );
    if (modalSteps.length > 0) return modalSteps;
  }

  return onPage;
}

/**
 * Filter Level A steps for contextual Header help (legacy / tests).
 * When modal anchors are present, prefer steps whose `anchorId` is in that set;
 * otherwise match `navHref` to pathname and optionally page anchors.
 */
export function filterStepsForContext(input: TourContextInput): TourStep[] {
  const { steps, pathname, modalAnchorIds = [], pageAnchorIds = [] } = input;
  const candidates = steps.filter((s) => !isExcludedFromContextual(s.id));
  const modalSet = new Set(modalAnchorIds);
  const pageSet = new Set(pageAnchorIds);

  if (modalSet.size > 0) {
    const modalSteps = candidates.filter(
      (s) => s.anchorId != null && modalSet.has(s.anchorId),
    );
    if (modalSteps.length > 0) return modalSteps;
  }

  return candidates.filter((s) => {
    const byNav = s.navHref ? pathMatchesNavHref(pathname, s.navHref) : false;
    // Pathname wins for page tips. Page anchors alone must not pull tips from
    // other routes (shared chrome like header-create-lesson lives on every page).
    if (s.navHref) return byNav;
    if (s.anchorId != null && pageSet.size > 0) return pageSet.has(s.anchorId);
    return false;
  });
}

/** Synthetic single step when no contextual tips match. */
export function contextualEmptyStep(copy: { title: string; body: string }): TourStep {
  return {
    id: 'ctx-empty',
    title: copy.title,
    body: copy.body,
    pose: 'wave',
  };
}

/**
 * After the user clicks a nav target (Practice, Vocabulary, …), jump Level A
 * forward to the first later step that matches the new pathname.
 * Stays put when the current step already fits (same-page section tips).
 */
export function resolveLevelAIndexAfterNavigation(input: {
  steps: TourStep[];
  index: number;
  pathname: string;
}): number | null {
  const { steps, index, pathname } = input;
  if (index < 0 || index >= steps.length) return null;
  const current = steps[index];
  if (!current) return null;

  const stepFits = (s: TourStep) =>
    !s.navHref || pathMatchesHelpNavHref(pathname, s.navHref);

  if (stepFits(current)) return null;

  for (let i = index + 1; i < steps.length; i++) {
    const s = steps[i];
    if (s?.navHref && pathMatchesHelpNavHref(pathname, s.navHref)) {
      return i;
    }
  }
  return null;
}
