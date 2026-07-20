'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import type { Group, Object3D } from 'three';
import type { MascotPose } from '../../lib/mascot-capability';

/**
 * Renders the mascot GLB and drives a pose. Asset-agnostic: if the GLB ships named
 * animation clips it plays the one matching the pose (falls back to an "idle" clip
 * or the first clip); if it has none, a gentle procedural bob/sway is applied per pose.
 *
 * Important: `useGLTF` returns a **shared** cached scene. Multiple Canvases (corner
 * dock + empty-state + chat header) must each get a SkeletonUtils clone, otherwise
 * Three.js re-parents the same Object3D and Arvi vanishes from one mount.
 */
export function MascotModel({
  pose,
  src,
  onReady,
}: {
  pose: MascotPose;
  src: string;
  onReady?: () => void;
}) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(src);
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as Object3D, [scene]);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Do not gate with a ref flag: React Strict Mode runs effect → cleanup → effect,
    // and cancelling the first rAF would leave ready stuck forever.
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) onReady?.();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [cloned, onReady]);

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
    const g = group.current;
    // Procedural fallbacks for B7 poses until GLB clips exist.
    switch (pose) {
      case 'celebrate':
        g.position.y = Math.abs(Math.sin(t * 4)) * 0.12;
        g.rotation.y = Math.sin(t * 3) * 0.35;
        g.rotation.z = Math.sin(t * 5) * 0.08;
        break;
      case 'wave':
        g.position.y = Math.sin(t * 2) * 0.04;
        g.rotation.z = Math.sin(t * 6) * 0.2;
        g.rotation.y = 0.15;
        break;
      case 'encourage':
        g.position.y = Math.sin(t * 1.8) * 0.05;
        g.rotation.y = Math.sin(t * 1.2) * 0.2;
        g.rotation.z = 0;
        break;
      case 'think':
        g.position.y = Math.sin(t * 0.9) * 0.03;
        g.rotation.y = -0.2 + Math.sin(t * 0.6) * 0.05;
        g.rotation.z = 0.05;
        break;
      case 'sleep':
        g.position.y = Math.sin(t * 0.7) * 0.02;
        g.rotation.z = 0.12;
        g.rotation.y = 0.1;
        break;
      case 'point':
        g.position.y = Math.sin(t * 1.4) * 0.04;
        g.rotation.y = 0.35;
        g.rotation.z = -0.05;
        break;
      case 'greet':
        g.position.y = Math.sin(t * 2.2) * 0.06;
        g.rotation.y = Math.sin(t * 1.5) * 0.3;
        g.rotation.z = 0;
        break;
      default:
        g.position.y = Math.sin(t * 1.6) * 0.06;
        g.rotation.y = Math.sin(t * 0.5) * 0.25;
        g.rotation.z = 0;
    }
  });

  return <primitive ref={group} object={cloned} dispose={null} />;
}
