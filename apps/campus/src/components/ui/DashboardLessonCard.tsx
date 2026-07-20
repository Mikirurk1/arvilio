import type { CSSProperties, ReactNode } from 'react';
import { Clock3, Lock } from 'lucide-react';
import { Badge } from './Badge';

export type DashboardLessonCardProps = {
  title: ReactNode;
  description: ReactNode;
  typeLabel?: ReactNode;
  typeClassName?: string;
  duration: ReactNode;
  difficulty: ReactNode;
  locked?: boolean;
  lockLabel?: ReactNode;
  className?: string;
  lockedClassName?: string;
  style?: CSSProperties;
  tagClassName?: string;
  titleClassName?: string;
  descClassName?: string;
  footerClassName?: string;
  metaClassName?: string;
  metaItemClassName?: string;
  lockOverlayClassName?: string;
};

export function DashboardLessonCard({
  title,
  description,
  typeLabel,
  typeClassName,
  duration,
  difficulty,
  locked = false,
  lockLabel = 'Locked',
  className,
  lockedClassName,
  style,
  tagClassName,
  titleClassName,
  descClassName,
  footerClassName,
  metaClassName,
  metaItemClassName,
  lockOverlayClassName,
}: DashboardLessonCardProps) {
  return (
    <div className={[className, locked ? lockedClassName : ''].filter(Boolean).join(' ')} style={style}>
      {typeLabel ? <Badge className={[tagClassName, typeClassName].filter(Boolean).join(' ')}>{typeLabel}</Badge> : null}
      <div className={titleClassName}>{title}</div>
      <div className={descClassName}>{description}</div>
      <div className={footerClassName}>
        <div className={metaClassName}>
          <span className={metaItemClassName}>
            <Clock3 size={13} /> {duration}
          </span>
          <span className={metaItemClassName}>{difficulty}</span>
        </div>
      </div>
      {locked ? (
        <div className={lockOverlayClassName}>
          <Lock size={14} /> {lockLabel}
        </div>
      ) : null}
    </div>
  );
}
