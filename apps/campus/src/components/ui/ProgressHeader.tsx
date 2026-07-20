import type { ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type ProgressHeaderProps = {
  current: number;
  total: number;
  className?: string;
  label?: ReactNode;
  barClassName?: string;
  fillClassName?: string;
  labelClassName?: string;
};

export function ProgressHeader({
  current,
  total,
  className,
  label,
  barClassName,
  fillClassName,
  labelClassName,
}: ProgressHeaderProps) {
  const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((current / total) * 100))) : 0;

  return (
    <div className={[uiStyles.progressHeader, className].filter(Boolean).join(' ')}>
      <div className={[uiStyles.progressBar, barClassName].filter(Boolean).join(' ')}>
        <div className={[uiStyles.progressFill, fillClassName].filter(Boolean).join(' ')} style={{ width: `${pct}%` }} />
      </div>
      <span className={[uiStyles.progressLabel, labelClassName].filter(Boolean).join(' ')}>
        {label ?? `${current} / ${total}`}
      </span>
    </div>
  );
}
