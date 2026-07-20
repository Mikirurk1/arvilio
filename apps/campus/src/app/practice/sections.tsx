'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Gamepad2, Mic, Repeat, Target, Trophy } from 'lucide-react';
import { Badge, type BadgeVariant } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import uiStyles from '../../components/ui/ui.module.scss';
import styles from './page.module.scss';

export type PracticeActivityTagVariant = 'green' | 'blue' | 'amber' | 'neutral';

export type PracticeActivity = {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  tagVariant: PracticeActivityTagVariant;
  stat?: string;
  accent?: 'green' | 'blue' | 'purple' | 'amber' | 'rose';
  disabled?: boolean;
};

const iconById: Record<string, ReactNode> = {
  'book-open': <BookOpen size={20} strokeWidth={2} aria-hidden />,
  target: <Target size={20} strokeWidth={2} aria-hidden />,
  mic: <Mic size={20} strokeWidth={2} aria-hidden />,
  repeat: <Repeat size={20} strokeWidth={2} aria-hidden />,
  'gamepad-2': <Gamepad2 size={20} strokeWidth={2} aria-hidden />,
  trophy: <Trophy size={20} strokeWidth={2} aria-hidden />,
};

const iconToneByAccent: Record<NonNullable<PracticeActivity['accent']>, string> = {
  green: uiStyles.iconTintGreen,
  blue: uiStyles.iconTintBlue,
  purple: uiStyles.iconTintPurple,
  amber: uiStyles.iconTintAmber,
  rose: uiStyles.iconTintRose,
};

type AccentKey = NonNullable<PracticeActivity['accent']>;

const shelfAccentByAccent: Record<AccentKey, string> = {
  green: styles.shelfAccentGreen,
  blue: styles.shelfAccentBlue,
  purple: styles.shelfAccentPurple,
  amber: styles.shelfAccentAmber,
  rose: styles.shelfAccentRose,
};

function iconToneClass(accent?: PracticeActivity['accent']): string {
  return accent ? iconToneByAccent[accent] : uiStyles.iconTintGreen;
}

function shelfAccentClass(accent?: PracticeActivity['accent']): string {
  return accent ? shelfAccentByAccent[accent] : styles.shelfAccentGreen;
}

function toBadgeVariant(tagVariant: PracticeActivityTagVariant): BadgeVariant {
  if (tagVariant === 'green') return 'green';
  if (tagVariant === 'blue') return 'blue';
  if (tagVariant === 'amber') return 'amber';
  return 'neutral';
}

export function PracticeActivitiesGrid({ activities }: { activities: ReadonlyArray<PracticeActivity> }) {
  const t = useCampusT();
  const active = activities.filter((activity) => !activity.disabled);
  const comingSoon = activities.filter((activity) => activity.disabled);

  return (
    <div className={styles.modulesLayout}>
      <div className={styles.shelfList} data-tour-anchor="practice-hub-cards">
        {active.map((activity) => (
          <Link
            key={activity.id}
            href={activity.href}
            className={`${styles.shelfRow} ${shelfAccentClass(activity.accent)}`}
            data-tour-anchor={
              activity.id === 'vocab'
                ? 'practice-card-vocabulary'
                : activity.id === 'quiz'
                  ? 'practice-card-quiz'
                  : activity.id === 'speaking'
                    ? 'practice-card-speaking'
                    : activity.id === 'irregular'
                      ? 'practice-card-irregular'
                      : undefined
            }
          >
            <span className={`${styles.shelfIcon} ${iconToneClass(activity.accent)}`}>
              {iconById[activity.icon] ?? <BookOpen size={20} strokeWidth={2} aria-hidden />}
            </span>
            <span className={styles.shelfText}>
              <span className={styles.shelfTitle}>{activity.title}</span>
              <span className={styles.shelfDesc}>{activity.description}</span>
            </span>
            <span className={styles.shelfRight}>
              {activity.stat ? (
                <Badge variant={toBadgeVariant(activity.tagVariant)} className={styles.shelfStat}>
                  {activity.stat}
                </Badge>
              ) : null}
              <span className={styles.shelfArrow} aria-hidden><ArrowRight size={14} strokeWidth={2.5} /></span>
            </span>
          </Link>
        ))}
      </div>

      {comingSoon.length > 0 ? (
        <div className={styles.soonBlock}>
          <p className={styles.soonHeading}>{t('practice.comingSoon')}</p>
          <ul className={styles.soonList}>
            {comingSoon.map((activity) => (
              <li key={activity.id} className={styles.soonItem}>
                <span className={`${styles.soonIcon} ${iconToneClass(activity.accent)}`}>
                  {iconById[activity.icon]}
                </span>
                <span className={styles.soonText}>
                  <span className={styles.soonTitle}>{activity.title}</span>
                  <span className={styles.soonDesc}>{activity.description}</span>
                </span>
                <Badge variant="neutral" className={styles.soonBadge}>
                  {activity.tag}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
