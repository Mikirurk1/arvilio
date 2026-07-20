import type { MascotPose } from '../../lib/mascot-capability';

/**
 * 2D fallback for Arvi the Speaker-puff (Phase 4.5.4). Shown when WebGL is
 * unavailable, `prefers-reduced-motion` is set, or the GLB hasn't been added yet.
 * Brand-green rounded body with a friendly face + soundwave ears.
 */
export function MascotFallback({ size = 72, pose = 'idle' }: { size?: number; pose?: MascotPose }) {
  const happy = pose === 'celebrate' || pose === 'greet';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Arvi mascot"
      style={{ display: 'block' }}
    >
      {/* soundwave ears */}
      <circle cx="28" cy="26" r="9" fill="var(--green, #2f9e54)" />
      <circle cx="72" cy="26" r="9" fill="var(--green, #2f9e54)" />
      {/* body */}
      <ellipse cx="50" cy="56" rx="34" ry="32" fill="var(--green, #2f9e54)" />
      {/* face */}
      <ellipse cx="50" cy="58" rx="24" ry="22" fill="#fff" />
      {/* eyes */}
      <circle cx="41" cy="54" r="4" fill="#1f2b30" />
      <circle cx="59" cy="54" r="4" fill="#1f2b30" />
      {/* smile */}
      <path
        d={happy ? 'M40 64 q10 12 20 0' : 'M41 65 q9 7 18 0'}
        stroke="#1f2b30"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
