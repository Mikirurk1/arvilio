import type { ReactNode } from 'react';
import { Clock3, GraduationCap } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export type CalendarEventCardProps = {
  typeLabel: ReactNode;
  typeVariant?: 'blue' | 'green' | 'amber' | 'neutral' | 'rose';
  statusLabel: ReactNode;
  statusVariant?: 'blue' | 'green' | 'amber' | 'neutral' | 'rose';
  title: ReactNode;
  time: ReactNode;
  /** When set, shown after time as `(durationLabel)`. */
  durationLabel?: ReactNode;
  teacherName: ReactNode;
  actionLabel: ReactNode;
  onAction: () => void;
  className?: string;
  headerClassName?: string;
  typeClassName?: string;
  statusClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  teacherClassName?: string;
  actionsClassName?: string;
  actionButtonClassName?: string;
};

export function CalendarEventCard({
  typeLabel,
  typeVariant = 'blue',
  statusLabel,
  statusVariant = 'neutral',
  title,
  time,
  durationLabel,
  teacherName,
  actionLabel,
  onAction,
  className,
  headerClassName,
  typeClassName,
  statusClassName,
  titleClassName,
  metaClassName,
  teacherClassName,
  actionsClassName,
  actionButtonClassName,
}: CalendarEventCardProps) {
  return (
    <div className={className}>
      <div className={headerClassName}>
        <Badge className={typeClassName} variant={typeVariant}>
          {typeLabel}
        </Badge>
        <Badge className={statusClassName} variant={statusVariant}>
          {statusLabel}
        </Badge>
      </div>
      <div className={titleClassName}>{title}</div>
      <div className={metaClassName}>
        <Clock3 size={14} /> {time}
        {durationLabel ? <> ({durationLabel})</> : null}
      </div>
      <div className={teacherClassName}>
        <GraduationCap size={14} /> {teacherName}
      </div>
      <div className={actionsClassName}>
        <Button type="button" className={actionButtonClassName} onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
