/** Client-only capability checks for the 3D mascot (Phase 4.5.4). */

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

export type MascotPose = 'idle' | 'greet' | 'point' | 'celebrate';
