import { createElement, type ElementType, type ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Renders before the title (e.g. back link). */
  back?: ReactNode;
  actions?: ReactNode;
  titleAs?: ElementType;
  className?: string;
  backClassName?: string;
  textClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function PageHeader({
  title,
  subtitle,
  back,
  actions,
  titleAs: TitleTag = 'h1',
  className,
  backClassName,
  textClassName,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  return (
    <div className={[uiStyles.pageHeader, className].filter(Boolean).join(' ')}>
      <div className={uiStyles.pageHeaderRow}>
        <div className={[uiStyles.pageHeaderStart, textClassName].filter(Boolean).join(' ')}>
          {back ? (
            <div className={[uiStyles.pageHeaderBack, backClassName].filter(Boolean).join(' ')}>{back}</div>
          ) : null}
          {createElement(
            TitleTag,
            { className: [uiStyles.pageHeaderTitle, titleClassName].filter(Boolean).join(' ') },
            title,
          )}
        </div>
        {actions}
      </div>
      {subtitle ? (
        <p className={[uiStyles.pageHeaderSubtitle, subtitleClassName].filter(Boolean).join(' ')}>{subtitle}</p>
      ) : null}
    </div>
  );
}
