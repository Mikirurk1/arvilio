/** Viewport placement for the tour card next to a spotlight rect. */

export type SpotlightRect = { top: number; left: number; width: number; height: number };

/** Which edge of the card the caret sits on (points toward the spotlight). */
export type TourArrowSide = 'left' | 'right' | 'top' | 'bottom';

export type TourCardPlacement = {
  top: number;
  left: number;
  arrow: TourArrowSide;
};

const GAP = 14;
const VIEW_PAD = 12;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max));
}

/**
 * Prefer to the right of a left-rail nav target; fall back below / left / above.
 * Positions are clamped into the viewport before selection.
 */
export function placeTourCard(
  spotlight: SpotlightRect,
  viewport: { width: number; height: number },
  cardW = 420,
  cardH = 260,
): TourCardPlacement {
  const { width: vw, height: vh } = viewport;
  const maxLeft = Math.max(VIEW_PAD, vw - cardW - VIEW_PAD);
  const maxTop = Math.max(VIEW_PAD, vh - cardH - VIEW_PAD);

  const candidates: TourCardPlacement[] = [
    {
      top: clamp(spotlight.top, VIEW_PAD, maxTop),
      left: clamp(spotlight.left + spotlight.width + GAP, VIEW_PAD, maxLeft),
      arrow: 'left',
    },
    {
      top: clamp(spotlight.top + spotlight.height + GAP, VIEW_PAD, maxTop),
      left: clamp(spotlight.left, VIEW_PAD, maxLeft),
      arrow: 'top',
    },
    {
      top: clamp(spotlight.top, VIEW_PAD, maxTop),
      left: clamp(spotlight.left - cardW - GAP, VIEW_PAD, maxLeft),
      arrow: 'right',
    },
    {
      top: clamp(spotlight.top - cardH - GAP, VIEW_PAD, maxTop),
      left: clamp(spotlight.left, VIEW_PAD, maxLeft),
      arrow: 'bottom',
    },
  ];

  const overlapsSpotlight = (p: TourCardPlacement) =>
    !(
      p.left + cardW < spotlight.left - 4 ||
      p.left > spotlight.left + spotlight.width + 4 ||
      p.top + cardH < spotlight.top - 4 ||
      p.top > spotlight.top + spotlight.height + 4
    );

  const preferred = candidates.find((p) => !overlapsSpotlight(p));
  return preferred ?? candidates[0];
}
