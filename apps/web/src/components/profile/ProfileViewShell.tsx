'use client';

import type { ReactNode } from 'react';
import { AchievementCard, Badge, PageHeader, ProfileHero, Tabs, type BadgeVariant, type TabsItem } from '../ui';
import styles from './ProfileViewShell.module.scss';

type ProfileAchievement = {
  icon: ReactNode;
  label: string;
  description?: string;
  unlocked: boolean;
};

type HeroStat = {
  value: ReactNode;
  label: ReactNode;
};

export type ProfileViewShellProps<T extends string> = {
  title: string;
  subtitle: string;
  avatar: ReactNode;
  name: ReactNode;
  meta: ReactNode;
  badges: Array<{ label: ReactNode; variant?: BadgeVariant }>;
  stats: HeroStat[];
  achievements: readonly ProfileAchievement[];
  tab: T;
  onTabChange: (next: T) => void;
  tabs: TabsItem<T>[];
};

export function ProfileViewShell<T extends string>({
  title,
  subtitle,
  avatar,
  name,
  meta,
  badges,
  stats,
  achievements,
  tab,
  onTabChange,
  tabs,
}: ProfileViewShellProps<T>) {
  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={title}
        subtitle={subtitle}
      />

      <ProfileHero
        className={styles.profileHero}
        avatarClassName={styles.avatarBig}
        infoClassName={styles.heroInfo}
        nameClassName={styles.heroName}
        metaClassName={styles.heroMeta}
        badgesClassName={styles.heroBadges}
        statsClassName={styles.heroStats}
        statClassName={styles.heroStat}
        statValueClassName={styles.heroStatVal}
        statLabelClassName={styles.heroStatLbl}
        avatar={avatar}
        name={name}
        meta={meta}
        badges={badges.map((badge, index) => (
          <Badge
            key={`${index}-${badge.label?.toString() ?? 'badge'}`}
            className={styles.badge}
            variant={badge.variant ?? 'neutral'}
          >
            {badge.label}
          </Badge>
        ))}
        stats={stats}
      />

      <div className={styles.achievementsRow}>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.label}
            icon={achievement.icon}
            label={achievement.label}
            unlocked={achievement.unlocked}
            className={styles.achievement}
            unlockedClassName={styles.achievementUnlocked}
            lockedClassName={styles.achievementLocked}
            iconClassName={styles.achievementIcon}
            labelClassName={styles.achievementLabel}
            tooltipClassName={styles.achievementTooltip}
            description={achievement.description}
          />
        ))}
      </div>

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        ariaLabel="Profile tabs"
        listClassName={styles.tabsRow}
        triggerClassName={styles.tabBtn}
        activeTriggerClassName={styles.tabActive}
        panelClassName={styles.tabPanel}
        items={tabs}
      />
    </div>
  );
}
