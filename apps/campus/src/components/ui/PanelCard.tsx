import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type PanelCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  /** Lift + stronger shadow on hover (student roster cards). */
  interactive?: boolean;
  /** Stretch to fill grid/flex parent height. */
  fillHeight?: boolean;
};

export function PanelCard({
  as: Tag = 'div',
  children,
  interactive = false,
  fillHeight = false,
  className,
  ...props
}: PanelCardProps) {
  return createElement(
    Tag,
    {
      className: [
        uiStyles.panelCard,
        interactive ? uiStyles.panelCardInteractive : '',
        fillHeight ? uiStyles.panelCardFillHeight : '',
        className,
      ]
        .filter(Boolean)
        .join(' '),
      ...props,
    },
    children,
  );
}
