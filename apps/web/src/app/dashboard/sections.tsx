'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  defaultGoalDateKey,
  formatIrregularVerbRow,
  GOAL_TIER_LABELS,
  pickIrregularVerbOfDay,
} from '@pkg/types';
import { Button, SurfaceCard } from '../../components/ui';
import { useActiveRoleKey } from '../../lib/active-user';
import { PRACTICE_SESSION_LOGGED_EVENT } from '../../lib/practice-session-tracker';
import { useDashboardStore } from '../../stores/dashboard-store';
import { useVocabularyStore } from '../../stores/vocabulary-store';
import { monthCalendarMeta } from '../../lib/dashboard-hero';
import { toast } from '../../features/notifications';
import styles from './page.module.scss';

function formatGoalProgress(current: number, target: number, label: string): string {
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
    return capped >= target ? 'Done' : `${capped}/${target}`;
  }
  return `${capped}/${target} ${label}`;
}

export function DailyGoalsCard() {
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
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>Daily goals</div>
      {loading ? (
        <p className={styles.goalsSubtitle}>Loading…</p>
      ) : isError ? (
        <p className={styles.goalsSubtitle}>
          Could not load goals.{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchGoals(true)}>
            Retry
          </Button>
        </p>
      ) : (
        <>
          <div className={styles.goalsSubtitle}>
            {total > 0 ? `${completed} of ${total} completed` : 'No goals for today'}
          </div>
          {rows.map((goal) => {
            const progressText = formatGoalProgress(
              goal.progressCurrent,
              goal.progressTarget,
              goal.progressLabel,
            );
            const tierLabel = GOAL_TIER_LABELS[goal.difficulty];
            return (
              <Link
                key={goal.id}
                href={goal.actionPath}
                className={styles.goalItem}
                aria-label={`${goal.text}. ${progressText || (goal.done ? 'Completed' : 'In progress')}`}
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
      toast.success('Word saved', 'Added to your vocabulary');
    } catch {
      toast.error('Could not save word', 'Try again');
    } finally {
      setSaving(false);
    }
  };

  const phoneticLine = [word?.phonetic, word?.partOfSpeech].filter(Boolean).join(' · ');

  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>Word of the day</div>
      {loading ? (
        <p className={styles.goalsSubtitle}>Loading…</p>
      ) : isError ? (
        <p className={styles.goalsSubtitle}>
          Could not load word.{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchWordOfDay(true)}>
            Retry
          </Button>
        </p>
      ) : !word ? (
        <p className={styles.goalsSubtitle}>Add vocabulary cards to get a word of the day.</p>
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
              {word.cardId ? 'Already saved' : saving ? 'Saving…' : 'Save'}
            </Button>
            <Link href="/practice/vocabulary" className={`${styles.btn} ${styles.btnGreen}`}>
              Practice now
            </Link>
          </div>
        </>
      )}
    </SurfaceCard>
  );
}

export function StreakCalendarCard() {
  const role = useActiveRoleKey();
  const streak = useDashboardStore((s) => s.streak);
  const fetchStreak = useDashboardStore((s) => s.fetchStreak);

  useEffect(() => {
    if (role === 'student') void fetchStreak();
  }, [role, fetchStreak]);

  if (role !== 'student') return null;

  const loading = streak.status === 'loading' || streak.status === 'idle';
  const isError = streak.status === 'error';
  const cal = monthCalendarMeta(streak.data);

  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitle}>{cal.title}</div>
      {loading ? (
        <p className={styles.calSub}>Loading…</p>
      ) : isError ? (
        <p className={styles.calSub}>
          Could not load streak.{' '}
          <Button type="button" variant="ghost" className={styles.goalsRetry} onClick={() => void fetchStreak(true)}>
            Retry
          </Button>
        </p>
      ) : (
        <p className={styles.calSub}>
          {cal.streakDays > 0 ? `${cal.streakDays}-day streak` : 'Start your streak today'}
        </p>
      )}
      <div className={styles.calGrid}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
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
        View full calendar →
      </Link>
    </SurfaceCard>
  );
}

export function IrregularVerbOfDayCard() {
  const role = useActiveRoleKey();
  const verb = useMemo(() => pickIrregularVerbOfDay(defaultGoalDateKey()), []);

  if (role !== 'student') return null;

  return (
    <SurfaceCard className={styles.panel}>
      <div className={styles.sectionTitleRow}>
        <span className={styles.sectionTitle}>Irregular verb of the day</span>
        <span className={styles.grammarTag}>Grammar</span>
      </div>
      <div className={styles.wordBig}>{verb.base}</div>
      <div className={styles.verbFormsGrid}>
        <div className={styles.verbFormCell}>
          <span className={styles.verbFormLabel}>Past simple</span>
          <span className={styles.verbFormValue}>{verb.pastSimple}</span>
        </div>
        <div className={styles.verbFormCell}>
          <span className={styles.verbFormLabel}>Past participle</span>
          <span className={styles.verbFormValue}>{verb.pastParticiple}</span>
        </div>
      </div>
      <p className={styles.verbRowHint}>{formatIrregularVerbRow(verb)}</p>
      <Link href="/practice/irregular-verbs" className={`${styles.btn} ${styles.btnGreen}`}>
        Practice verbs
      </Link>
    </SurfaceCard>
  );
}
