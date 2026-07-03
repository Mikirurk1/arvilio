import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type StatTileProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  subtext?: ReactNode;
  interactive?: boolean;
  iconClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  subtextClassName?: string;
};

export function StatTile({
  as: Tag = 'div',
  icon,
  label,
  value,
  subtext,
  interactive = false,
  className,
  iconClassName,
  labelClassName,
  valueClassName,
  subtextClassName,
  ...props
}: StatTileProps) {
  return createElement(
    Tag,
    {
      className: [uiStyles.statTile, interactive ? uiStyles.statTileInteractive : '', className]
        .filter(Boolean)
        .join(' '),
      ...props,
    },
    <>
      {icon ? <div className={[uiStyles.statIcon, iconClassName].filter(Boolean).join(' ')}>{icon}</div> : null}
      <div className={[uiStyles.statLabel, labelClassName].filter(Boolean).join(' ')}>{label}</div>
      <div className={[uiStyles.statValue, valueClassName].filter(Boolean).join(' ')}>{value}</div>
      {subtext ? <div className={[uiStyles.statSubtext, subtextClassName].filter(Boolean).join(' ')}>{subtext}</div> : null}
    </>,
  );
}
