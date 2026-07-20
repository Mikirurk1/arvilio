import type { SpotlightRect } from './tour-placement';

function rectFromEl(el: Element, pad = 6): SpotlightRect {
  const rect = el.getBoundingClientRect();
  return {
    top: Math.max(0, rect.top - pad),
    left: Math.max(0, rect.left - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

function isMeasurable(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Resolve spotlight DOM node: prefer page `data-tour-anchor`, then sidebar `data-tour-nav`.
 * Zero-size / hidden anchors fall through to nav.
 */
export function resolveTourTargetElement(opts: {
  anchorId?: string;
  navHref?: string;
}): Element | null {
  if (typeof document === 'undefined') return null;

  if (opts.anchorId) {
    const el = document.querySelector(`[data-tour-anchor="${opts.anchorId}"]`);
    if (el && isMeasurable(el)) return el;
  }

  if (opts.navHref) {
    const el = document.querySelector(`[data-tour-nav="${opts.navHref}"]`);
    if (el && isMeasurable(el)) return el;
  }

  return null;
}

/** True when enough of the target sits inside the viewport (with margin). */
export function isTourTargetInView(el: Element, margin = 56): boolean {
  if (typeof window === 'undefined') return true;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  return (
    rect.bottom > margin &&
    rect.top < vh - margin &&
    rect.right > margin &&
    rect.left < vw - margin
  );
}

/**
 * Scroll the tour target into view when it is off-screen.
 * @returns true if a scroll was started (caller should remeasure after settle).
 */
export function scrollTourTargetIntoView(opts: {
  anchorId?: string;
  navHref?: string;
}): boolean {
  const el = resolveTourTargetElement(opts);
  if (!el || isTourTargetInView(el)) return false;
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({
    block: 'center',
    inline: 'nearest',
    behavior: reduceMotion ? 'auto' : 'smooth',
  });
  return true;
}

/**
 * Resolve spotlight: prefer page `data-tour-anchor`, then sidebar `data-tour-nav`.
 * Missing anchor falls through to nav so the card still points at where to click.
 * Returns null → ProductTour shows centered card.
 */
export function measureTourTarget(opts: {
  anchorId?: string;
  navHref?: string;
}): SpotlightRect | null {
  const el = resolveTourTargetElement(opts);
  return el ? rectFromEl(el) : null;
}
