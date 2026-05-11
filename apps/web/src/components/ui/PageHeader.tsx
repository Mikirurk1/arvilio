import type { ElementType, ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  titleAs?: ElementType;
  className?: string;
  textClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  titleAs: TitleTag = 'h1',
  className,
  textClassName,
  titleClassName,
  subtitleClassName,
}: PageHeaderProps) {
  return (
    <div className={[uiStyles.pageHeader, className].filter(Boolean).join(' ')}>
      <div className={[uiStyles.pageHeaderText, textClassName].filter(Boolean).join(' ')}>
        <TitleTag className={[uiStyles.pageHeaderTitle, titleClassName].filter(Boolean).join(' ')}>{title}</TitleTag>
        {subtitle ? (
          <p className={[uiStyles.pageHeaderSubtitle, subtitleClassName].filter(Boolean).join(' ')}>{subtitle}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
