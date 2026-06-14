import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type TabPanelCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
};

/** Profile / staff tab content shell — matches profile tab panels. */
export function TabPanelCard({
  as: Tag = 'div',
  children,
  className,
  ...props
}: TabPanelCardProps) {
  return (
    <Tag
      className={[uiStyles.tabPanelCard, className].filter(Boolean).join(' ') || undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
