'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen, CalendarCheck } from 'lucide-react';
import {
  AchievementCard,
  Badge,
  PageHeader,
  ProfileHero,
  Tabs,
  type BadgeVariant,
  type TabsItem,
} from '../ui';
import type { ProfileHeroAction } from '../../lib/profile-hero-highlights';
import { useCampusT } from '../../lib/cms';
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
  icon?: ReactNode;
  iconTone?: 'green' | 'blue' | 'amber';
};

export type { ProfileHeroAction } from '../../lib/profile-hero-highlights';

export type ProfileViewShellProps<T extends string> = {
  title: string;
  subtitle: string;
  /** Renders before the title (e.g. back link). */
  back?: ReactNode;
  avatar: ReactNode;
  name: ReactNode;
  meta: ReactNode;
  /** Secondary meta line (e.g. email · timezone). */
  metaExtra?: ReactNode;
  badges: Array<{ label: ReactNode; variant?: BadgeVariant }>;
  stats: HeroStat[];
  /** Compact action card on the right of the hero identity row (desktop). */
  heroAction?: ProfileHeroAction | null;
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
  /** Overrides default `profile.tabsAria` when set (e.g. student detail page). */
  tabsAriaLabel?: string;
};

function heroActionToneClass(
  tone: ProfileHeroAction['tone'],
  styles: Record<string, string>,
): string {
  if (tone === 'green') return styles.heroActionGreen;
  if (tone === 'amber') return styles.heroActionAmber;
  if (tone === 'neutral') return styles.heroActionNeutral;
  return styles.heroActionBlue;
}

function heroActionIcon(tone: ProfileHeroAction['tone']) {
  if (tone === 'green') return <BookOpen size={16} aria-hidden />;
  return <CalendarCheck size={16} aria-hidden />;
}

export function ProfileViewShell<T extends string>({
  title,
  subtitle,
  back,
  avatar,
  name,
  meta,
  metaExtra,
  badges,
  stats,
  heroAction,
  heroActions,
  achievements,
  tab,
  onTabChange,
  tabs,
  keepMountedTabs = true,
  tabsAriaLabel,
}: ProfileViewShellProps<T>) {
  const t = useCampusT();

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        back={back}
        title={title}
        subtitle={subtitle}
      />

      <div className={styles.profileHero}>
        <div className={styles.profileHeroInner}>
          <div className={styles.profileHeroMain}>
            <ProfileHero
              className={styles.profileHeroIdentity}
              avatarClassName={styles.avatarBig}
              infoClassName={styles.heroInfo}
              nameClassName={styles.heroName}
              metaClassName={styles.heroMeta}
              metaExtra={metaExtra}
              metaExtraClassName={styles.heroMetaSecondary}
              badgesClassName={styles.heroBadges}
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
              stats={[]}
            />
            {heroAction ? (
              <Link
                href={heroAction.href}
                className={[
                  styles.heroActionCard,
                  heroActionToneClass(heroAction.tone, styles),
                ].join(' ')}
                aria-label={`${heroAction.eyebrow}: ${heroAction.title}`}
              >
                <span
                  className={[
                    styles.heroActionIcon,
                    heroActionToneClass(heroAction.tone, styles),
                  ].join(' ')}
                  aria-hidden
                >
                  {heroActionIcon(heroAction.tone)}
                </span>
                <span className={styles.heroActionBody}>
                  <span className={styles.heroActionEyebrow}>{heroAction.eyebrow}</span>
                  <span className={styles.heroActionTitle}>{heroAction.title}</span>
                  {heroAction.subtitle ? (
                    <span className={styles.heroActionSubtitle}>{heroAction.subtitle}</span>
                  ) : null}
                </span>
              </Link>
            ) : null}
          </div>
          {stats.length > 0 ? (
            <div className={styles.heroStats} role="list">
              {stats.map((stat, index) => {
                const toneClass =
                  stat.iconTone === 'blue'
                    ? styles.heroStatItemBlue
                    : stat.iconTone === 'amber'
                      ? styles.heroStatItemAmber
                      : stat.iconTone === 'green'
                        ? styles.heroStatItemGreen
                        : styles.heroStatItemNeutral;

                const iconToneClass =
                  stat.iconTone === 'blue'
                    ? styles.heroStatIconBlue
                    : stat.iconTone === 'amber'
                      ? styles.heroStatIconAmber
                      : styles.heroStatIconGreen;

                return (
                  <div
                    key={`${stat.label?.toString() ?? index}`}
                    className={[styles.heroStatItem, toneClass].join(' ')}
                    role="listitem"
                  >
                    <div className={styles.heroStatTop}>
                      {stat.icon ? (
                        <span
                          className={[styles.heroStatIcon, iconToneClass].join(' ')}
                          aria-hidden
                        >
                          {stat.icon}
                        </span>
                      ) : null}
                      <div className={styles.heroStatLabel}>{stat.label}</div>
                    </div>
                    <div className={styles.heroStatValue}>{stat.value}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {achievements.length > 0 ? (
        <section
          className={styles.achievementsSection}
          aria-labelledby="profile-recent-achievements"
        >
          <h2
            id="profile-recent-achievements"
            className={styles.achievementsSectionTitle}
          >
            {t('profile.recentAchievements')}
          </h2>
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
        </section>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={onTabChange}
        ariaLabel={tabsAriaLabel ?? t('profile.tabsAria')}
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
