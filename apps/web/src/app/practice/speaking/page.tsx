'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mic, PauseCircle, PlayCircle } from 'lucide-react';
import { Button, PageHeader, SurfaceCard } from '../../../components/ui';
import { useAuth } from '../../../lib/auth-context';
import { usePracticeSessionTracker } from '../../../lib/practice-session-tracker';
import styles from './page.module.scss';

const SPEAKING_PROMPTS = [
  'Describe how your day started and what you plan to do next.',
  'Explain a recent lesson topic in your own words as if teaching a friend.',
  'Talk for one minute about a goal you want to reach this month.',
] as const;

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function SpeakingPracticePage() {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);

  usePracticeSessionTracker(user?.id, 'speaking', active);

  useEffect(() => {
    if (!active || startedAtMs === null) return;
    const timer = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtMs) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, startedAtMs]);

  const sessionHint = useMemo(() => {
    if (active) {
      return elapsedSec >= 30
        ? 'This session is long enough to count toward speaking achievements.'
        : 'Keep speaking for at least 30 seconds so the session is recorded.';
    }
    if (elapsedSec === 0) {
      return 'Start a guided speaking session and talk through one or more prompts.';
    }
    return elapsedSec >= 30
      ? 'Session finished. It should appear in your speaking stats shortly.'
      : 'Session was too short to count. Start again and keep speaking for at least 30 seconds.';
  }, [active, elapsedSec]);

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="Speaking practice"
        subtitle="Use short guided prompts, speak out loud, and record real speaking sessions for achievements."
      />

      <div className={styles.layout}>
        <SurfaceCard className={styles.sessionCard}>
          <div className={styles.sessionIcon}>
            <Mic size={20} />
          </div>
          <div className={styles.sessionLabel}>Speaking session</div>
          <div className={styles.sessionValue}>{formatElapsed(elapsedSec)}</div>
          <p className={styles.sessionHint}>{sessionHint}</p>

          <div className={styles.actions}>
            {active ? (
              <Button
                type="button"
                variant="ghost"
                startIcon={<PauseCircle size={16} />}
                onClick={() => setActive(false)}
              >
                Finish session
              </Button>
            ) : (
              <Button
                type="button"
                startIcon={<PlayCircle size={16} />}
                onClick={() => {
                  setElapsedSec(0);
                  setStartedAtMs(Date.now());
                  setActive(true);
                }}
              >
                Start speaking
              </Button>
            )}
          </div>
        </SurfaceCard>

        <div className={styles.prompts}>
          {SPEAKING_PROMPTS.map((prompt, index) => (
            <SurfaceCard key={prompt} className={styles.promptCard}>
              <div className={styles.promptIndex}>Prompt {index + 1}</div>
              <div className={styles.promptText}>{prompt}</div>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </div>
  );
}

