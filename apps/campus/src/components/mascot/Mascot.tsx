'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { MascotFallback } from './MascotFallback';
import { MascotErrorBoundary } from './MascotErrorBoundary';
import {
  hasWebGL,
  prefersReducedMotion,
  MASCOT_SRC,
  type MascotPose,
} from '../../lib/mascot-capability';
import styles from './Mascot.module.scss';

const MascotCanvas = dynamic(() => import('./MascotCanvas'), {
  ssr: false,
  // Parent SVG stays visible while the R3F chunk downloads — never flash empty.
  loading: () => null,
});

/**
 * Arvi the Speaker-puff (Phase 4.5.4). Renders the 3D GLB when the device supports
 * it (WebGL + motion allowed) and the asset loads; otherwise a 2D SVG fallback.
 * The 3D bundle is lazy-loaded, so it never blocks first paint.
 *
 * Loading UX: SVG stays under the canvas with a soft pulse until the GLB is ready,
 * then crossfades to 3D (avoids SVG → blank → 3D flicker).
 */
export function Mascot({ pose = 'idle', size = 72 }: { pose?: MascotPose; size?: number }) {
  const [can3d, setCan3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCan3d(hasWebGL() && !prefersReducedMotion());
  }, []);

  const onReady = useCallback(() => {
    setReady(true);
  }, []);

  const onFail = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);

  const show3d = can3d && !failed;
  const loading3d = show3d && !ready;
  const use3dView = show3d && ready;

  return (
    <span
      data-mascot
      data-mascot-pose={pose}
      data-mascot-ready={use3dView ? 'true' : 'false'}
      className={styles.wrap}
      style={{ width: size, height: size }}
    >
      <span
        className={[
          styles.layer,
          styles.fallback,
          loading3d ? styles.fallbackLoading : '',
          use3dView ? styles.fallbackHidden : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={use3dView || undefined}
      >
        <MascotFallback size={size} pose={pose} />
      </span>
      {show3d ? (
        <span
          className={[styles.layer, styles.canvas, use3dView ? styles.canvasReady : '']
            .filter(Boolean)
            .join(' ')}
          aria-hidden={!use3dView || undefined}
        >
          <MascotErrorBoundary fallback={null} onError={onFail}>
            <MascotCanvas pose={pose} src={MASCOT_SRC} size={size} onReady={onReady} />
          </MascotErrorBoundary>
        </span>
      ) : null}
    </span>
  );
}
