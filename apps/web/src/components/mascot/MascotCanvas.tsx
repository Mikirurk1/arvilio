'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center } from '@react-three/drei';
import { MascotModel } from './MascotModel';
import type { MascotPose } from '../../lib/mascot-capability';

/**
 * Lazy-loaded R3F island (Phase 4.5.4). Loaded via `next/dynamic` (client-only) so
 * Three.js never blocks first paint. Pauses the render loop when the tab is hidden
 * to respect the perf budget. Default export for `next/dynamic`.
 */
export default function MascotCanvas({
  pose,
  src,
  size,
}: {
  pose: MascotPose;
  src: string;
  size: number;
}) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 3.4], fov: 35 }}
      style={{ width: size, height: size }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <Suspense fallback={null}>
        <Center>
          <MascotModel pose={pose} src={src} />
        </Center>
      </Suspense>
    </Canvas>
  );
}
