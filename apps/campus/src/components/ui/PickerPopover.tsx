'use client';

import { useLayoutEffect, useState, type ReactNode } from 'react';
import { BodyPortal } from './BodyPortal';
import pickerStyles from './picker.module.scss';

type PickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  minWidth?: number;
  /** When false, popover uses `minWidth` only (calendar), not the trigger width. */
  matchAnchorWidth?: boolean;
  children: ReactNode;
};

export function PickerPopover({
  open,
  anchorEl,
  minWidth = 280,
  matchAnchorWidth = true,
  children,
}: PickerPopoverProps) {
  const [style, setStyle] = useState<React.CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setStyle(null);
      return;
    }

    const update = () => {
      const rect = anchorEl.getBoundingClientRect();
      const width = matchAnchorWidth ? Math.max(rect.width, minWidth) : minWidth;
      const left = matchAnchorWidth
        ? Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
        : Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
      const top = rect.bottom + 6;
      const maxTop = window.innerHeight - 16;
      setStyle({
        position: 'fixed',
        top: Math.min(top, maxTop),
        left,
        width,
        zIndex: 2400,
      });
    };

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorEl, minWidth, matchAnchorWidth]);

  if (!open || !style) return null;

  return (
    <BodyPortal>
      <div
        className={pickerStyles.popover}
        style={style}
        role="dialog"
        data-picker-popover
        data-anchor-align={matchAnchorWidth ? 'right' : 'left'}
      >
        {children}
      </div>
    </BodyPortal>
  );
}
