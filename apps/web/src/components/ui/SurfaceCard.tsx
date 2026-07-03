import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import uiStyles from './ui.module.scss';

type SurfaceCardPadding = 'default' | 'compact' | 'none';

export type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  padding?: SurfaceCardPadding;
};

export function SurfaceCard({
  as: Tag = 'div',
  children,
  padding = 'default',
  className,
  ...props
}: SurfaceCardProps) {
  const paddingClass =
    padding === 'default' ? uiStyles.surfaceCardDefault : padding === 'compact' ? uiStyles.surfaceCardCompact : '';

  return createElement(
    Tag,
    { className: [uiStyles.surfaceCard, paddingClass, className].filter(Boolean).join(' '), ...props },
    children,
  );
}
