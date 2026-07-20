'use client';

import type { ReactNode } from 'react';
import { PanelCard, SectionHeader } from '../ui';
import { StatisticsSection } from './StatisticsSection';

export type DashboardSectionProps = {
  profile: boolean;
  icon?: ReactNode;
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  children: ReactNode;
};

export function DashboardSection({
  profile,
  icon,
  title,
  description,
  aside,
  className,
  fullWidth,
  children,
}: DashboardSectionProps) {
  if (profile && icon) {
    return (
      <StatisticsSection
        icon={icon}
        title={title}
        description={description}
        aside={aside}
        className={className}
        fullWidth={fullWidth}
      >
        {children}
      </StatisticsSection>
    );
  }
  return (
    <PanelCard className={className}>
      <SectionHeader title={title} action={aside} />
      {children}
    </PanelCard>
  );
}
