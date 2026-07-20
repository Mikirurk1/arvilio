'use client';

import type { ReactNode } from 'react';
import { AchievementCard, TabPanelCard } from '../ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();

  return (
    <TabPanelCard>
      <h2 className={styles.sectionTitle}>{t('profile.achievements.title')}</h2>
      <p className={styles.panelHint}>
        {t('profile.achievements.hint')}
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
