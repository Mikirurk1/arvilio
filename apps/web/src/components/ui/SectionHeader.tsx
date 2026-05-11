import Link from 'next/link';
import type { ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type SectionHeaderProps = {
  title: ReactNode;
  action?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  titleClassName?: string;
  actionClassName?: string;
};

export function SectionHeader({
  title,
  action,
  actionHref,
  actionLabel,
  className,
  titleClassName,
  actionClassName,
}: SectionHeaderProps) {
  return (
    <div className={[uiStyles.sectionHeader, className].filter(Boolean).join(' ')}>
      <div className={[uiStyles.sectionHeaderTitle, titleClassName].filter(Boolean).join(' ')}>{title}</div>
      {action ??
        (actionHref && actionLabel ? (
          <Link href={actionHref} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : null)}
    </div>
  );
}
