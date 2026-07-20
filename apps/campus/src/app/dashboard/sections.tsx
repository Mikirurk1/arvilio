'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  defaultGoalDateKey,
  formatIrregularVerbRow,
  pickIrregularVerbOfDay,
  type GoalDifficulty,
} from '@pkg/types';
import { Button, SurfaceCard } from '../../components/ui';
import { useActiveRoleKey } from '../../lib/active-user';
import { useCampusI18n, useCampusT } from '../../lib/cms';
import { PRACTICE_SESSION_LOGGED_EVENT } from '../../lib/practice-session-tracker';
import { useDashboardStore } from '../../stores/dashboard-store';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { monthCalendarMeta } from '../../lib/dashboard-hero';
import { toast } from '../../features/notifications';
import styles from './page.module.scss';

function formatGoalProgress(
  current: number,
  target: number,
  label: string,
  doneLabel: string,
): string {
  if (target <= 0) return '';
  const capped = Math.min(current, target);
  if (label === '%') return `${capped}/${target}%`;
  if (
    label === 'quiz' ||
    label === 'quizzes' ||
    label === 'recording' ||
    label === 'recordings' ||
    label === 'lesson' ||
    label === 'perfect'
  ) {
    return capped >= target ? doneLabel : `${capped}/${target}`;
  }
  return `${capped}/${target} ${label}`;
}

const GOAL_TIER_KEYS: Record<GoalDifficulty, string> = {
  1: 'dashboard.goalTier.easy',
  2: 'dashboard.goalTier.medium',
  3: 'dashboard.goalTier.hard',
  4: 'dashboard.goalTier.expert',
};

export function DailyGoalsCard() {
  const t = useCampusT();
  const role = useActiveRoleKey();
  const goals = useDashboardStore((s) => s.goals);
  const fetchGoals = useDashboardStore((s) => s.fetchGoals);

  useEffect(() => {
    if (role === 'student') void fetchGoals();
  }, [role, fetchGoals]);

  useEffect(() => {
    if (role !== 'student') return;
    const onPracticeLogged = () => {
      void fetchGoals(true);
    };
    window.addEventListener(PRACTICE_SESSION_LOGGED_EVENT, onPracticeLogged);
    return () => window.removeEventListener(PRACTICE_SESSION_LOGGED_EVENT, onPracticeLogged);
  }, [role, fetchGoals]);

  if (role !== 'student') return null;

  const rows = goals.data ?? [];
  const completed = rows.filter((g) => g.done).length;
  const total = rows.length;
  const loading = goals.status === 'loading' || goals.status === 'idle';
  const isError = goals.status === 'error';

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-daily-goals">
      <div className={styles.sectionTitle}>{t('dashboard.dailyGoals')}</div>
      {loading ? (
        <p className={styles.goalsSubtitle}>{t('common.loading')}</p>
      ) : isError ? (
        <p className={styles.goalsSubtitle}>
          {t('dashboard.goals.loadError')}{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchGoals(true)}>
            {t('dashboard.goals.retry')}
          </Button>
        </p>
      ) : (
        <>
          <div className={styles.goalsSubtitle}>
            {total > 0
              ? t('dashboard.goals.completedOf', { completed, total })
              : t('dashboard.goals.none')}
          </div>
          {rows.map((goal) => {
            const progressText = formatGoalProgress(
              goal.progressCurrent,
              goal.progressTarget,
              goal.progressLabel,
              t('dashboard.goals.done'),
            );
            const tierLabel = t(GOAL_TIER_KEYS[goal.difficulty]);
            return (
              <Link
                key={goal.id}
                href={goal.actionPath}
                className={styles.goalItem}
                aria-label={`${goal.text}. ${progressText || (goal.done ? t('dashboard.goals.completed') : t('dashboard.goals.inProgress'))}`}
              >
                <span className={`${styles.goalCheck} ${goal.done ? styles.done : ''}`}>
                  {goal.done ? <span className={styles.checkmark} /> : null}
                </span>
                <span className={`${styles.goalText} ${goal.done ? styles.goalDone : ''}`}>{goal.text}</span>
                <span className={styles.goalMeta}>
                  {!goal.done && progressText ? (
                    <span className={styles.goalProgress}>{progressText}</span>
                  ) : null}
                  <span className={styles.goalTier}>{tierLabel}</span>
                </span>
              </Link>
            );
          })}
        </>
      )}
    </SurfaceCard>
  );
}

export function WordOfDayCard() {
  const t = useCampusT();
  const role = useActiveRoleKey();
  const wordOfDay = useDashboardStore((s) => s.wordOfDay);
  const fetchWordOfDay = useDashboardStore((s) => s.fetchWordOfDay);
  const addCard = useVocabularyStore((s) => s.addCard);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role === 'student') void fetchWordOfDay();
  }, [role, fetchWordOfDay]);

  if (role !== 'student') return null;

  const loading = wordOfDay.status === 'loading' || wordOfDay.status === 'idle';
  const isError = wordOfDay.status === 'error';
  const word = wordOfDay.data;

  const handleSave = async () => {
    if (!word || word.cardId || saving) return;
    setSaving(true);
    try {
      await addCard({ text: word.text, status: 'new' });
      await fetchWordOfDay(true);
      toast.success(t('dashboard.word.savedTitle'), t('dashboard.word.savedBody'));
    } catch {
      toast.error(t('dashboard.word.saveErrorTitle'), t('dashboard.word.tryAgain'));
    } finally {
      setSaving(false);
    }
  };

  const phoneticLine = [word?.phonetic, word?.partOfSpeech].filter(Boolean).join(' · ');

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-word-of-day">
      <div className={styles.sectionTitle}>{t('dashboard.wordOfDay')}</div>
      {loading ? (
        <p className={styles.goalsSubtitle}>{t('common.loading')}</p>
      ) : isError ? (
        <p className={styles.goalsSubtitle}>
          {t('dashboard.word.loadError')}{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchWordOfDay(true)}>
            {t('dashboard.goals.retry')}
          </Button>
        </p>
      ) : !word ? (
        <p className={styles.goalsSubtitle}>{t('dashboard.word.empty')}</p>
      ) : (
        <>
          <div className={styles.wordBig}>{word.text}</div>
          {phoneticLine ? <div className={styles.wordPhonetic}>{phoneticLine}</div> : null}
          <div className={styles.wordDef}>{word.definition}</div>
          {word.example ? (
            <div className={styles.wordExample}>&quot;{word.example}&quot;</div>
          ) : null}
          <div className={styles.wordActions}>
            <Button
              className={styles.btn}
              disabled={Boolean(word.cardId) || saving}
              onClick={() => void handleSave()}
            >
              {word.cardId
                ? t('dashboard.word.alreadySaved')
                : saving
                  ? t('dashboard.word.saving')
                  : t('dashboard.word.save')}
            </Button>
            <Link href="/practice/vocabulary" className={`${styles.btn} ${styles.btnGreen}`}>
              {t('dashboard.hero.practiceNow')}
            </Link>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}

export function StreakCalendarCard() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const role = useActiveRoleKey();
  const streak = useDashboardStore((s) => s.streak);
  const fetchStreak = useDashboardStore((s) => s.fetchStreak);

  useEffect(() => {
    if (role === 'student') void fetchStreak();
  }, [role, fetchStreak]);

  if (role !== 'student') return null;

  const loading = streak.status === 'loading' || streak.status === 'idle';
  const isError = streak.status === 'error';
  const cal = monthCalendarMeta(streak.data, new Date(), locale === 'uk' ? 'uk' : 'en');
  const weekdays = [
    t('dashboard.cal.mon'),
    t('dashboard.cal.tue'),
    t('dashboard.cal.wed'),
    t('dashboard.cal.thu'),
    t('dashboard.cal.fri'),
    t('dashboard.cal.sat'),
    t('dashboard.cal.sun'),
  ];

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-streak">
      <div className={styles.sectionTitle}>{cal.title}</div>
      {loading ? (
        <p className={styles.calSub}>{t('common.loading')}</p>
      ) : isError ? (
        <p className={styles.calSub}>
          {t('dashboard.streak.loadError')}{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchStreak(true)}>
            {t('dashboard.goals.retry')}
          </Button>
        </p>
      ) : (
        <p className={styles.calSub}>
          {cal.streakDays > 0
            ? t('dashboard.streak.days', { days: cal.streakDays })
            : t('dashboard.streak.start')}
        </p>
      )}
      <div className={styles.calGrid}>
        {weekdays.map((day, i) => (
          <div key={i} className={styles.calDayName}>
            {day}
          </div>
        ))}
        {Array.from({ length: cal.leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} className={styles.calEmpty} />
        ))}
        {cal.days.map((day) => (
          <div
            key={day}
            className={`${styles.calDay} ${cal.activeDays.includes(day) ? styles.calDone : ''} ${day === cal.today ? styles.calToday : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
      <Link href="/calendar" className={styles.calLink}>
        {t('dashboard.streak.viewCalendar')}
      </Link>
    </SurfaceCard>
  );
}

export function IrregularVerbOfDayCard() {
  const t = useCampusT();
  const role = useActiveRoleKey();
  const verb = useMemo(() => pickIrregularVerbOfDay(defaultGoalDateKey()), []);

  if (role !== 'student') return null;

  return (
    <SurfaceCard className={styles.panel} data-tour-anchor="dash-irregular-verb">
      <div className={styles.sectionTitleRow}>
        <span className={styles.sectionTitle}>{t('dashboard.verb.title')}</span>
        <span className={styles.grammarTag}>{t('dashboard.verb.grammar')}</span>
      </div>
      <div className={styles.wordBig}>{verb.base}</div>
      <div className={styles.verbFormsGrid}>
        <div className={styles.verbFormCell}>
          <span className={styles.verbFormLabel}>{t('dashboard.verb.pastSimple')}</span>
          <span className={styles.verbFormValue}>{verb.pastSimple}</span>
        </div>
        <div className={styles.verbFormCell}>
          <span className={styles.verbFormLabel}>{t('dashboard.verb.pastParticiple')}</span>
          <span className={styles.verbFormValue}>{verb.pastParticiple}</span>
        </div>
      </div>
      <p className={styles.verbRowHint}>{formatIrregularVerbRow(verb)}</p>
      <Link href="/practice/irregular-verbs" className={`${styles.btn} ${styles.btnGreen}`}>
        {t('dashboard.verb.practice')}
      </Link>
    </SurfaceCard>
  );
}
