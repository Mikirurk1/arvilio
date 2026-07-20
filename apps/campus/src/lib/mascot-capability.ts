/** Client-only capability checks for the 3D mascot (Phase 4.5.4 / B7 Arvi). */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')),
    );
  } catch {
    return false;
  }
}

/** Asset path — drop any `.glb` here now and replace later without code changes. */
export const MASCOT_SRC = '/mascot/arvi.glb';

/**
 * Arvi poses. Tour/GLB clips: idle|greet|point|celebrate.
 * B7 additions (procedural / 2D fallback until clips exist): think|encourage|sleep|wave.
 */
export type MascotPose =
  | 'idle'
  | 'greet'
  | 'point'
  | 'celebrate'
  | 'think'
  | 'encourage'
  | 'sleep'
  | 'wave';

export const MASCOT_POSES: readonly MascotPose[] = [
  'idle',
  'greet',
  'point',
  'celebrate',
  'think',
  'encourage',
  'sleep',
  'wave',
] as const;

/** Default auto-return to idle for transient reaction poses (ms). */
export const ARVI_REACTION_MS = 2_200;
