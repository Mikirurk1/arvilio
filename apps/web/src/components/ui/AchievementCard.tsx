'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Tooltip } from './Tooltip';

export type AchievementCardProps = {
  icon: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  unlocked?: boolean;
  className?: string;
  unlockedClassName?: string;
  lockedClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  tooltipClassName?: string;
};

export function AchievementCard({
  icon,
  label,
  description,
  unlocked = false,
  className,
  unlockedClassName,
  lockedClassName,
  iconClassName,
  labelClassName,
  tooltipClassName,
}: AchievementCardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <>
      <div
        ref={rootRef}
        className={[className, unlocked ? unlockedClassName : lockedClassName].filter(Boolean).join(' ')}
        tabIndex={description ? 0 : -1}
        onMouseEnter={() => {
          if (description) setTooltipOpen(true);
        }}
        onMouseLeave={() => setTooltipOpen(false)}
        onFocus={() => {
          if (description) setTooltipOpen(true);
        }}
        onBlur={() => setTooltipOpen(false)}
      >
        <div className={iconClassName}>{icon}</div>
        <div className={labelClassName}>{label}</div>
      </div>
      <Tooltip
        open={tooltipOpen && Boolean(description)}
        targetEl={rootRef.current}
        content={description ?? ''}
        placement="top"
        className={tooltipClassName}
      />
    </>
  );
}
