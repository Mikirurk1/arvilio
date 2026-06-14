'use client';

import { useEffect, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';

import { prefersReducedMotion } from './prefers-reduced-motion';

/**
 * Колбек отримує поточний prefers-reduced-motion: при `reduced === true`
 * пропусти tween-и руху і постав елементи одразу в кінцевий стан
 * (gsap.set), щоб контент не залежав від анімації.
 */
type GsapSetup = (reduced: boolean) => void;

/**
 * gsap.context зі scope-елементом і автоматичним cleanup на unmount.
 * Усі селектори всередині setup шукаються лише в межах scope;
 * revert() знімає інлайн-стилі, які додав GSAP.
 *
 * const ref = useRef<HTMLElement>(null);
 * useGsap(ref, (reduced) => {
 *   if (reduced) return;
 *   gsap.from('[data-animate]', { y: 16, opacity: 0, stagger: 0.05 });
 * });
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: GsapSetup,
  deps: DependencyList = [],
): void {
  useEffect(() => {
    const el = scope.current;
    if (!el) return undefined;

    const ctx = gsap.context(() => setup(prefersReducedMotion()), el);
    return () => ctx.revert();
    // Контракт хука: scope — стабільний ref, setup перезапускається лише за deps.
  }, deps);
}
