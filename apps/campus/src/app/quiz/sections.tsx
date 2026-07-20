'use client';

import { BriefcaseBusiness, FileText, RefreshCw, Scale } from 'lucide-react';
import { FeatureCard, ProgressHeader, StatTile } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import styles from './page.module.scss';

function topicIcon(tag: string) {
  const normalized = tag.toLowerCase();
  if (normalized.includes('grammar')) return <Scale size={18} />;
  if (normalized.includes('listening')) return <RefreshCw size={18} />;
  if (normalized.includes('vocabulary')) return <BriefcaseBusiness size={18} />;
  return <FileText size={18} />;
}

type QuizTopic = {
  id: string;
  title: string;
  desc: string;
  tag: string;
};

export function QuizTopicsGrid({ topics }: { topics: QuizTopic[] }) {
  const t = useCampusT();
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
          tag={t('quiz.topic.tag')}
          tagVariant="blue"
        />
      ))}
    </div>
  );
}

export function QuizResultStats({ score, total }: { score: number; total: number }) {
  const t = useCampusT();
  return (
    <div className={styles.resultStats}>
      <StatTile
        className={styles.resultStat}
        label={t('quiz.result.correct')}
        labelClassName={styles.resultStatLbl}
        value={score}
        valueClassName={`${styles.resultStatVal} ${styles.green}`}
      />
      <StatTile
        className={styles.resultStat}
        label={t('quiz.result.wrong')}
        labelClassName={styles.resultStatLbl}
        value={total - score}
        valueClassName={`${styles.resultStatVal} ${styles.rose}`}
      />
      <StatTile
        className={styles.resultStat}
        label={t('quiz.result.accuracy')}
        labelClassName={styles.resultStatLbl}
        value={`${total ? Math.round((score / total) * 100) : 0}%`}
        valueClassName={`${styles.resultStatVal} ${styles.amber}`}
      />
    </div>
  );
}

export function QuizProgress({ current, total }: { current: number; total: number }) {
  return (
    <ProgressHeader
      className={styles.qProgress}
      barClassName={styles.qProgressBar}
      fillClassName={styles.qProgressFill}
      labelClassName={styles.qProgressLbl}
      current={current}
      total={total}
    />
  );
}
