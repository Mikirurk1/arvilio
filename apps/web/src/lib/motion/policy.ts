/**
 * Motion policy — дзеркало docs/redesign/redesign-v2.md §2.2–2.3.
 * Default: CSS transitions (токени styles/tokens/_motion.scss).
 * GSAP — лише таймлайни/stagger/celebration у рідкі моменти (useGsap).
 */

/** Durations (ms) — синхронні з CSS-токенами --dur-* у _motion.scss. */
export const MOTION_DURATION_PRESS_MS = 140;
export const MOTION_DURATION_UI_MS = 180;
export const MOTION_DURATION_BASE_MS = 240;
export const MOTION_DURATION_MODAL_MS = 320;
/** Marketing / hero акценти (auth, рідкі empty states, celebration). */
export const MOTION_DURATION_HERO_MS = 600;

/** Пріоритет інструментів: 1 CSS → 2 GSAP (useGsap) → 3 Three.js (lazy, ssr: false). */
export const MOTION_TOOL = {
  CSS: 'css',
  GSAP: 'gsap',
  THREE: 'three',
} as const;

export type MotionTool = (typeof MOTION_TOOL)[keyof typeof MOTION_TOOL];

/** Поверхні, де декоративний рух заборонений (learning-first: урок/чат/квіз/оплата). */
export const MOTION_RESTRICTED_ROUTES = [
  '/lessons',
  '/chat',
  '/quiz',
  '/payment',
] as const;
