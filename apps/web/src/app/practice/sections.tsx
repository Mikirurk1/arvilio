import type { ReactNode } from 'react';
import { FeatureCard } from '../../components/ui';
import { BookOpen, Gamepad2, Mic, Target, Trophy } from 'lucide-react';
import styles from './page.module.scss';

export type PracticeActivity = {
  href: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  tagClass: keyof Pick<typeof styles, 'tagGreen' | 'tagBlue' | 'tagAmber' | 'tagMuted'>;
  stat?: string;
  accent?: 'green' | 'blue' | 'purple' | 'amber' | 'rose';
  disabled?: boolean;
};

export function PracticeActivitiesGrid({ activities }: { activities: ReadonlyArray<PracticeActivity> }) {
  const iconById: Record<string, ReactNode> = {
    'book-open': <BookOpen size={18} />,
    target: <Target size={18} />,
    mic: <Mic size={18} />,
    'gamepad-2': <Gamepad2 size={18} />,
    trophy: <Trophy size={18} />,
  };

  const accentClassByValue: Record<NonNullable<PracticeActivity['accent']>, string> = {
    green: styles.accentGreen,
    blue: styles.accentBlue,
    purple: styles.accentPurple,
    amber: styles.accentAmber,
    rose: styles.accentRose,
  };

  const accentToClass = (accent?: PracticeActivity['accent']): string =>
    accent ? accentClassByValue[accent] : styles.accentGreen;

  return (
    <div className={styles.grid}>
      {activities.map((activity) => (
        <div key={activity.title} className={styles.cardWrap}>
          {activity.stat ? <span className={styles.statPill}>{activity.stat}</span> : null}
          <FeatureCard
            href={activity.disabled ? undefined : activity.href}
            disabled={activity.disabled}
            className={`${styles.card} ${accentToClass(activity.accent)} ${activity.disabled ? styles.cardDisabled : ''}`}
            bodyClassName={styles.cardBody}
            iconClassName={styles.cardIcon}
            titleClassName={styles.cardTitle}
            descriptionClassName={styles.cardDesc}
            footerClassName={styles.cardFooter}
            title={activity.title}
            description={activity.description}
            icon={iconById[activity.icon] ?? <BookOpen size={18} />}
            tag={activity.tag}
            tagVariant={activity.tagClass === 'tagGreen' ? 'green' : activity.tagClass === 'tagBlue' ? 'blue' : activity.tagClass === 'tagAmber' ? 'amber' : 'neutral'}
          />
        </div>
      ))}
    </div>
  );
}
