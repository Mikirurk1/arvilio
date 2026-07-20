'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { countIrregularVerbs, listIrregularVerbs, type IrregularVerbTier } from '@pkg/types';
import { Button, Field, PageHeader, SegmentedControl, SurfaceCard } from '../../../components/ui';
import { useAuth } from '../../../lib/auth-context';
import { usePracticeSessionTracker } from '../../../lib/practice-session-tracker';
import { IrregularVerbsPlaySession } from '../../../features/irregular-verbs/IrregularVerbsPlaySession';
import { IrregularVerbsPlaySetup } from '../../../features/irregular-verbs/IrregularVerbsPlaySetup';
import { IrregularVerbsResult } from '../../../features/irregular-verbs/IrregularVerbsResult';
import { IrregularVerbsTable } from '../../../features/irregular-verbs/IrregularVerbsTable';
import {
  availableQuestionCounts,
  buildIrregularVerbQuestions,
  type IrregularVerbDrillQuestion,
  type IrregularVerbDrillResult,
  type IrregularVerbFormFocus,
  type IrregularVerbQuestionCount,
} from '../../../lib/irregular-verbs-drill';
import styles from './page.module.scss';

const TIER_STORAGE_KEY = 'irregular-verbs-tier';

type PlayPhase = 'table' | 'setup' | 'quiz' | 'result';

function readStoredTier(): IrregularVerbTier {
  if (typeof window === 'undefined') return 'common';
  const stored = window.localStorage.getItem(TIER_STORAGE_KEY);
  return stored === 'extended' ? 'extended' : 'common';
}

function defaultQuestionCount(tier: IrregularVerbTier): IrregularVerbQuestionCount {
  const options = availableQuestionCounts(tier);
  return options[0] ?? 10;
}

export default function IrregularVerbsPracticePage() {
  const { user } = useAuth();
  const [tier, setTier] = useState<IrregularVerbTier>('common');
  const [search, setSearch] = useState('');
  const [playPhase, setPlayPhase] = useState<PlayPhase>('table');
  const [formFocus, setFormFocus] = useState<IrregularVerbFormFocus>('mixed');
  const [questionCount, setQuestionCount] = useState<IrregularVerbQuestionCount>(10);
  const [questions, setQuestions] = useState<IrregularVerbDrillQuestion[]>([]);
  const [result, setResult] = useState<IrregularVerbDrillResult | null>(null);

  const practiceSessionActive =
    playPhase === 'setup' || playPhase === 'quiz' || playPhase === 'result';
  usePracticeSessionTracker(user?.id, 'games', practiceSessionActive);

  useEffect(() => {
    setTier(readStoredTier());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TIER_STORAGE_KEY, tier);
    setQuestionCount(defaultQuestionCount(tier));
  }, [tier]);

  const commonCount = countIrregularVerbs('common');
  const extendedCount = countIrregularVerbs('extended');

  const verbs = useMemo(() => {
    const pool = listIrregularVerbs(tier);
    const query = search.trim().toLowerCase();
    if (!query) return pool;
    return pool.filter(
      (verb) =>
        verb.base.toLowerCase().includes(query) ||
        verb.pastSimple.toLowerCase().includes(query) ||
        verb.pastParticiple.toLowerCase().includes(query),
    );
  }, [tier, search]);

  const poolForPlay = useMemo(() => listIrregularVerbs(tier), [tier]);
  const canStartDrill = poolForPlay.length >= 4;

  const pageSubtitle =
    playPhase === 'table'
      ? `${commonCount} common · ${extendedCount} total · study the table or start a drill`
      : 'Three Forms Drill — pick the missing past form';

  const openSetup = () => {
    setPlayPhase('setup');
    setResult(null);
  };

  const startDrill = () => {
    const built = buildIrregularVerbQuestions({ tier, formFocus, questionCount });
    setQuestions(built);
    setPlayPhase(built.length > 0 ? 'quiz' : 'setup');
  };

  const finishDrill = (nextResult: IrregularVerbDrillResult) => {
    setResult(nextResult);
    setPlayPhase('result');
  };

  const backToTable = () => {
    setPlayPhase('table');
    setQuestions([]);
    setResult(null);
  };

  const retryDrill = () => {
    startDrill();
  };

  return (
    <div className={`${styles.page} container container--page`}>
      <div className={styles.stack}>
        <PageHeader
          className={styles.pageHeader}
          titleClassName={styles.pageTitle}
          subtitleClassName={styles.pageSub}
          back={
            <Link href="/practice" className={styles.backLink} aria-label="Back to practice">
              <ArrowLeft size={16} aria-hidden />
            </Link>
          }
          title="Irregular verbs"
          subtitle={pageSubtitle}
        />

        {playPhase === 'table' ? (
          <>
            <SegmentedControl
              value={tier}
              onValueChange={setTier}
              ariaLabel="Verb list scope"
              className={styles.tierSwitch}
              options={[
                { value: 'common', label: `Common (${commonCount})` },
                { value: 'extended', label: `Extended (${extendedCount})` },
              ]}
            />

            <Field
              label="Search verbs"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search base or past forms…"
            />

            <IrregularVerbsTable verbs={verbs} />

            <div className={styles.playBar}>
              <SurfaceCard className={styles.playBarCard}>
                <div className={styles.playBarText}>
                  <p className={styles.playBarTitle}>Ready to practice?</p>
                  <p className={styles.playBarSub}>
                    Run a multiple-choice drill on the {tier} set ({poolForPlay.length} verbs).
                  </p>
                </div>
                <Button type="button" disabled={!canStartDrill} onClick={openSetup}>
                  <Play size={18} aria-hidden />
                  Play
                </Button>
              </SurfaceCard>
            </div>
          </>
        ) : null}

        {playPhase === 'setup' ? (
          <IrregularVerbsPlaySetup
            tier={tier}
            poolCount={poolForPlay.length}
            formFocus={formFocus}
            questionCount={questionCount}
            canStart={canStartDrill}
            onFormFocusChange={setFormFocus}
            onQuestionCountChange={setQuestionCount}
            onStart={startDrill}
            onCancel={backToTable}
          />
        ) : null}

        {playPhase === 'quiz' ? (
          <IrregularVerbsPlaySession
            questions={questions}
            onDone={finishDrill}
            onCancel={backToTable}
          />
        ) : null}

        {playPhase === 'result' && result ? (
          <IrregularVerbsResult result={result} onClose={backToTable} onRetry={retryDrill} />
        ) : null}
      </div>
    </div>
  );
}
