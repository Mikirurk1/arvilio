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
  heroActions?: ReactNode;
  achievements: readonly ProfileAchievement[];
  tab: T;
  onTabChange: (next: T) => void;
  tabs: TabsItem<T>[];
  /**
   * Keep inactive tab panels mounted. Disable when panels use `next/dynamic` lazy
   * chunks — hidden lazy trees break React Suspense boundaries on navigation.
   */
  keepMountedTabs?: boolean;
};

export function ProfileViewShell<T extends string>({
  title,
  subtitle,
  avatar,
  name,
  meta,
  badges,
  stats,
  heroActions,
  achievements,
  tab,
  onTabChange,
  tabs,
  keepMountedTabs = true,
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

      <div className={styles.profileHero}>
      <ProfileHero
        className={styles.profileHeroInner}
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
        name={
          heroActions ? (
            <div className={styles.heroNameRow}>
              <span className={styles.heroNameText}>{name}</span>
              <div className={styles.heroInlineActions}>{heroActions}</div>
            </div>
          ) : (
            name
          )
        }
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
      </div>

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
        keepMounted={keepMountedTabs}
        items={tabs}
      />
    </div>
  );
}
