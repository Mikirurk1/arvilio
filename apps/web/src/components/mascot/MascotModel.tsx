'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import type { Group } from 'three';
import type { MascotPose } from '../../lib/mascot-capability';

/**
 * Renders the mascot GLB and drives a pose. Asset-agnostic: if the GLB ships named
 * animation clips it plays the one matching the pose (falls back to an "idle" clip
 * or the first clip); if it has none, a gentle procedural idle bob/sway is applied.
 * So any placeholder GLB works today and a rigged Arvi drops in later unchanged.
 */
export function MascotModel({ pose, src }: { pose: MascotPose; src: string }) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(src);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (names.length === 0) return;
    const match =
      names.find((n) => n.toLowerCase().includes(pose)) ??
      names.find((n) => /idle/i.test(n)) ??
      names[0];
    const action = match ? actions[match] : undefined;
    action?.reset().fadeIn(0.25).play();
    return () => {
      action?.fadeOut(0.25);
    };
  }, [actions, names, pose]);

  useFrame((state) => {
    if (!group.current || names.length > 0) return;
    const t = state.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 1.6) * 0.06;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.25;
  });

  return <primitive ref={group} object={scene} dispose={null} />;
}
