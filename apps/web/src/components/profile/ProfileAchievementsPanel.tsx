'use client';

import type { ReactNode } from 'react';
import { AchievementCard, TabPanelCard } from '../ui';
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
    <TabPanelCard>
      <h2 className={styles.sectionTitle}>Achievements</h2>
      <p className={styles.panelHint}>
        Milestones from lessons, practice, and streaks. Locked badges unlock as you progress.
      </p>
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
    </TabPanelCard>
  );
}
