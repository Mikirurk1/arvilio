'use client';

import { createPortal } from 'react-dom';
import { useLayoutEffect, useState } from 'react';
import uiStyles from './ui.module.scss';

type TooltipProps = {
  open: boolean;
  content: React.ReactNode;
  targetEl: HTMLElement | null;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
};

/**
 * Якщо попередній tooltip зник менше ніж INSTANT_REOPEN_WINDOW_MS тому,
 * наступний відкривається миттєво (без entrance-анімації) — рух по тулбару
 * відчувається швидким, а перший показ зберігає м'яку появу.
 */
const INSTANT_REOPEN_WINDOW_MS = 250;
let lastTooltipHiddenAt = 0;

export function Tooltip({
  open,
  content,
  targetEl,
  placement = 'top',
  className,
}: TooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [instant, setInstant] = useState(false);

  useLayoutEffect(() => {
    if (!open) return undefined;
    setInstant(Date.now() - lastTooltipHiddenAt < INSTANT_REOPEN_WINDOW_MS);
    return () => {
      lastTooltipHiddenAt = Date.now();
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !targetEl) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const rect = targetEl.getBoundingClientRect();
      if (placement === 'right') {
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
        });
        return;
      }
      if (placement === 'left') {
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.left - 10,
        });
        return;
      }
      if (placement === 'bottom') {
        setCoords({
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
        return;
      }
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, targetEl, placement]);

  if (!open || !coords || typeof document === 'undefined') return null;

  const baseClass = {
    top: uiStyles.tooltipTop,
    right: uiStyles.tooltipRight,
    bottom: uiStyles.tooltipBottom,
    left: uiStyles.tooltipLeft,
  }[placement];
  return createPortal(
    <div
      className={[uiStyles.tooltipPortal, baseClass, className].filter(Boolean).join(' ')}
      style={coords}
      role="tooltip"
      data-instant={instant ? 'true' : undefined}
    >
      <span className={uiStyles.tooltipArrow} aria-hidden />
      {content}
    </div>,
    document.body,
  );
}

