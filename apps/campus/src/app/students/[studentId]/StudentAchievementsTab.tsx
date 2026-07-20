'use client';

import type { ReactNode } from 'react';
import { ProfileAchievementsPanel } from '../../../components/profile/ProfileAchievementsPanel';

export function StudentAchievementsTab({
  achievements,
}: {
  achievements: Array<{ icon: ReactNode; label: string; description?: string; unlocked: boolean }>;
}) {
  return <ProfileAchievementsPanel achievements={achievements} />;
}
