'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Swipe-to-close для лівого drawer (redesign v2 V1-03, emil-патерни):
 * - закриття за дистанцією (≥35% ширини) АБО velocity > 0.11 px/ms — швидкий
 *   флік закриває без дотягування;
 * - drag вправо за природну межу — damping ×0.12 (сповільнення, не стіна);
 * - pointer capture + ігнорування додаткових дотиків (multi-touch jump);
 * - вертикальний намір (|dy| > |dx|) віддає жест скролу навігації.
 * Інлайн-transform знімається на release: snap-back анімує CSS-transition
 * панелі, а закриття передає поточну позицію transition до -100%.
 */
const CLOSE_DISTANCE_RATIO = 0.35;
const CLOSE_VELOCITY = 0.11;
const MIN_INTENT_PX = 12;
const OVERDRAG_DAMPING = 0.12;

export function useDrawerSwipe(
  panelRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    const panel = panelRef.current;
    if (!enabled || !panel) return undefined;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let dx = 0;
    let axis: 'x' | 'y' | null = null;

    const resetInline = () => {
      panel.style.transition = '';
      panel.style.transform = '';
    };

    const onPointerDown = (event: PointerEvent) => {
      if (pointerId !== null) return; // другий палець — ігноруємо
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startTime = event.timeStamp;
      dx = 0;
      axis = null;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const moveX = event.clientX - startX;
      const moveY = event.clientY - startY;

      if (!axis) {
        if (Math.abs(moveX) < MIN_INTENT_PX && Math.abs(moveY) < MIN_INTENT_PX) return;
        axis = Math.abs(moveX) >= Math.abs(moveY) ? 'x' : 'y';
        if (axis === 'x') {
          panel.setPointerCapture(event.pointerId);
          panel.style.transition = 'none';
        }
      }
      if (axis !== 'x') return;

      dx = moveX;
      const offset = dx < 0 ? dx : dx * OVERDRAG_DAMPING;
      panel.style.transform = `translateX(${offset}px)`;
    };

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const wasHorizontal = axis === 'x';
      pointerId = null;
      axis = null;
      if (!wasHorizontal) return;

      if (panel.hasPointerCapture(event.pointerId)) {
        panel.releasePointerCapture(event.pointerId);
      }

      const elapsed = Math.max(1, event.timeStamp - startTime);
      const velocity = Math.abs(dx) / elapsed;
      const shouldClose =
        dx < 0 && (Math.abs(dx) >= panel.offsetWidth * CLOSE_DISTANCE_RATIO || velocity > CLOSE_VELOCITY);

      resetInline();
      if (shouldClose) onClose();
    };

    panel.addEventListener('pointerdown', onPointerDown);
    panel.addEventListener('pointermove', onPointerMove);
    panel.addEventListener('pointerup', finishDrag);
    panel.addEventListener('pointercancel', finishDrag);
    return () => {
      panel.removeEventListener('pointerdown', onPointerDown);
      panel.removeEventListener('pointermove', onPointerMove);
      panel.removeEventListener('pointerup', finishDrag);
      panel.removeEventListener('pointercancel', finishDrag);
      resetInline();
    };
  }, [panelRef, enabled, onClose]);
}
