import type { ReactNode } from 'react';
import { SurfaceCard } from './SurfaceCard';
import { ArviSlot } from '../mascot/ArviSlot';
import uiStyles from './ui.module.scss';

export type EmptyStateCardProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** When true, show Arvi sleep if no custom icon (true empties only — not error cards). */
  showArvi?: boolean;
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
  showArvi = false,
  action,
  className,
  titleClassName,
  descriptionClassName,
  iconClassName,
}: EmptyStateCardProps) {
  const resolvedIcon =
    icon ??
    (showArvi ? <ArviSlot variant="inline" pose="sleep" size={56} eager /> : null);

  return (
    <SurfaceCard className={[uiStyles.emptyState, className].filter(Boolean).join(' ')}>
      {resolvedIcon ? (
        <div className={[uiStyles.emptyStateIcon, iconClassName].filter(Boolean).join(' ')}>
          {resolvedIcon}
        </div>
      ) : null}
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
