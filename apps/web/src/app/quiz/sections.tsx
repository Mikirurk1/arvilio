'use client';

import { BriefcaseBusiness, FileText, RefreshCw, Scale } from 'lucide-react';
import { FeatureCard, ProgressHeader, StatTile } from '../../components/ui';
import type { MockQuizTopic } from '../../mocks';
import styles from './page.module.scss';

function topicIcon(tag: string) {
  const normalized = tag.toLowerCase();
  if (normalized.includes('grammar')) return <Scale size={18} />;
  if (normalized.includes('listening')) return <RefreshCw size={18} />;
  if (normalized.includes('vocabulary')) return <BriefcaseBusiness size={18} />;
  return <FileText size={18} />;
}

export function QuizTopicsGrid({ topics }: { topics: MockQuizTopic[] }) {
  return (
    <div className={styles.topicsGrid}>
      {topics.map((topic) => (
        <FeatureCard
          key={topic.id}
          className={styles.topicCard}
          iconClassName={styles.topicIcon}
          titleClassName={styles.topicTitle}
          descriptionClassName={styles.topicDesc}
          footerClassName={styles.topicFooter}
          title={topic.title}
          description={topic.desc}
          icon={topicIcon(topic.tag)}
          tag={topic.tag}
          tagVariant={topic.tag.toLowerCase().includes('grammar') ? 'blue' : 'green'}
        />
      ))}
    </div>
  );
}

export function QuizResultStats({ score, total }: { score: number; total: number }) {
  return (
    <div className={styles.resultStats}>
      <StatTile className={styles.resultStat} label="Correct" labelClassName={styles.resultStatLbl} value={score} valueClassName={`${styles.resultStatVal} ${styles.green}`} />
      <StatTile className={styles.resultStat} label="Wrong" labelClassName={styles.resultStatLbl} value={total - score} valueClassName={`${styles.resultStatVal} ${styles.rose}`} />
      <StatTile className={styles.resultStat} label="Accuracy" labelClassName={styles.resultStatLbl} value={`${total ? Math.round((score / total) * 100) : 0}%`} valueClassName={`${styles.resultStatVal} ${styles.amber}`} />
    </div>
  );
}

export function QuizProgress({ current, total }: { current: number; total: number }) {
  return <ProgressHeader className={styles.qProgress} barClassName={styles.qProgressBar} fillClassName={styles.qProgressFill} labelClassName={styles.qProgressLbl} current={current} total={total} />;
}
