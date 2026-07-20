import type { HTMLAttributes, ReactNode } from 'react';
import uiStyles from './ui.module.scss';

export type BadgeVariant = 'neutral' | 'blue' | 'green' | 'amber' | 'rose';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClass: Record<BadgeVariant, string> = {
  neutral: uiStyles.badgeNeutral,
  blue: uiStyles.badgeBlue,
  green: uiStyles.badgeGreen,
  amber: uiStyles.badgeAmber,
  rose: uiStyles.badgeRose,
};

const sizeClass: Record<BadgeSize, string> = {
  sm: uiStyles.badgeSm,
  md: uiStyles.badgeMd,
};

export function Badge({ children, variant = 'neutral', size = 'md', className, ...props }: BadgeProps) {
  return (
    <span
      className={[uiStyles.badge, sizeClass[size], variantClass[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
