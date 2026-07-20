import type { MascotPose } from '../../lib/mascot-capability';
import { useCampusT } from '../../lib/cms';

/**
 * 2D fallback for Arvi the Speaker-puff (Phase 4.5.4 / B7).
 * Shown when WebGL is unavailable, `prefers-reduced-motion` is set, or the GLB fails.
 * Pose tweaks are CSS-light SVG differences (no clip dependency).
 */
export function MascotFallback({ size = 72, pose = 'idle' }: { size?: number; pose?: MascotPose }) {
  const t = useCampusT();
  const happy = pose === 'celebrate' || pose === 'greet' || pose === 'wave';
  const sleepy = pose === 'sleep';
  const thinking = pose === 'think';
  const encourage = pose === 'encourage';
  const pointing = pose === 'point';

  const eyeY = sleepy ? 56 : 54;
  const eyeOpen = !sleepy;
  const smilePath = happy
    ? 'M40 64 q10 12 20 0'
    : encourage
      ? 'M40 66 q10 6 20 0'
      : sleepy
        ? 'M42 66 q8 4 16 0'
        : 'M41 65 q9 7 18 0';

  const tilt =
    pose === 'wave'
      ? 'rotate(-8 50 50)'
      : pointing
        ? 'rotate(6 50 50)'
        : thinking
          ? 'rotate(-4 50 50)'
          : sleepy
            ? 'rotate(4 50 50)'
            : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={t('mascot.ariaLabel')}
      style={{ display: 'block' }}
    >
      <g transform={tilt}>
        {/* soundwave ears */}
        <circle cx="28" cy="26" r="9" fill="var(--green, #2f9e54)" />
        <circle cx="72" cy="26" r="9" fill="var(--green, #2f9e54)" />
        {/* body — school brand via --green / --accent-primary when set */}
        <ellipse
          cx="50"
          cy="56"
          rx="34"
          ry="32"
          fill="var(--green, var(--accent-primary, #2f9e54))"
        />
        {/* face */}
        <ellipse cx="50" cy="58" rx="24" ry="22" fill="#fff" />
        {/* eyes */}
        {eyeOpen ? (
          <>
            <circle cx="41" cy={eyeY} r="4" fill="#1f2b30" />
            <circle cx="59" cy={eyeY} r="4" fill="#1f2b30" />
          </>
        ) : (
          <>
            <path d="M37 56 h8" stroke="#1f2b30" strokeWidth="3" strokeLinecap="round" />
            <path d="M55 56 h8" stroke="#1f2b30" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {/* smile / soft mouth */}
        <path
          d={smilePath}
          stroke="#1f2b30"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* think: small dots */}
        {thinking ? (
          <>
            <circle cx="78" cy="22" r="2.5" fill="#1f2b30" opacity="0.55" />
            <circle cx="84" cy="14" r="2" fill="#1f2b30" opacity="0.4" />
            <circle cx="88" cy="6" r="1.5" fill="#1f2b30" opacity="0.3" />
          </>
        ) : null}
        {/* wave: tiny arm hint */}
        {pose === 'wave' ? (
          <ellipse cx="78" cy="62" rx="7" ry="4" fill="var(--green, #2f9e54)" transform="rotate(-25 78 62)" />
        ) : null}
        {pointing ? (
          <ellipse cx="82" cy="58" rx="8" ry="3.5" fill="var(--green, #2f9e54)" transform="rotate(20 82 58)" />
        ) : null}
      </g>
    </svg>
  );
}
