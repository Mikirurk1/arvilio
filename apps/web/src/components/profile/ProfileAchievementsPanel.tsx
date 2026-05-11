'use client';

import type { ReactNode } from 'react';
import { AchievementCard, SurfaceCard } from '../ui';
import styles from '../../app/profile/page.module.scss';

type ProfileAchievement = {
  icon: ReactNode;
  label: string;
  description?: string;
  unlocked: boolean;
};

export function ProfileAchievementsPanel({
  achievements,
}: {
  achievements: ProfileAchievement[];
}) {
  return (
    <SurfaceCard className={styles.formCard}>
      <div className={styles.achievementsGrid}>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.label}
            icon={achievement.icon}
            label={achievement.label}
            description={achievement.description}
            unlocked={achievement.unlocked}
            className={styles.achievement}
            unlockedClassName={styles.achievementUnlocked}
            lockedClassName={styles.achievementLocked}
            iconClassName={styles.achievementIcon}
            labelClassName={styles.achievementLabel}
            tooltipClassName={styles.achievementTooltip}
          />
        ))}
      </div>
    </SurfaceCard>
  );
}
