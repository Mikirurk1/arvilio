import type { ReactNode } from 'react';
import { SurfaceCard } from './SurfaceCard';
import uiStyles from './ui.module.scss';

export type EmptyStateCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  iconClassName?: string;
};

export function EmptyStateCard({
  title,
  description,
  icon,
  action,
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
}: EmptyStateCardProps) {
  return (
    <SurfaceCard className={[uiStyles.emptyState, className].filter(Boolean).join(' ')}>
      {icon ? <div className={[uiStyles.emptyStateIcon, iconClassName].filter(Boolean).join(' ')}>{icon}</div> : null}
      <div className={[uiStyles.emptyStateTitle, titleClassName].filter(Boolean).join(' ')}>{title}</div>
      {description ? (
        <div className={[uiStyles.emptyStateDescription, descriptionClassName].filter(Boolean).join(' ')}>
          {description}
        </div>
      ) : null}
      {action}
    </SurfaceCard>
  );
}
