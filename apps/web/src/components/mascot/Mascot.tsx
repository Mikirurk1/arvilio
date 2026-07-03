'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { MascotFallback } from './MascotFallback';
import { MascotErrorBoundary } from './MascotErrorBoundary';
import { hasWebGL, prefersReducedMotion, MASCOT_SRC, type MascotPose } from '../../lib/mascot-capability';

const MascotCanvas = dynamic(() => import('./MascotCanvas'), {
  ssr: false,
  loading: () => null,
});

/**
 * Arvi the Speaker-puff (Phase 4.5.4). Renders the 3D GLB when the device supports
 * it (WebGL + motion allowed) and the asset loads; otherwise a 2D SVG fallback.
 * The 3D bundle is lazy-loaded, so it never blocks first paint.
 */
export function Mascot({ pose = 'idle', size = 72 }: { pose?: MascotPose; size?: number }) {
  const [can3d, setCan3d] = useState(false);
  useEffect(() => {
    setCan3d(hasWebGL() && !prefersReducedMotion());
  }, []);

  // data-mascot / data-mascot-pose: stable hooks for E2E (expectArvi helper)
  return (
    <span data-mascot data-mascot-pose={pose} style={{ display: 'inline-flex' }}>
      {can3d ? (
        <MascotErrorBoundary fallback={<MascotFallback size={size} pose={pose} />}>
          <MascotCanvas pose={pose} src={MASCOT_SRC} size={size} />
        </MascotErrorBoundary>
      ) : (
        <MascotFallback size={size} pose={pose} />
      )}
    </span>
  );
}
