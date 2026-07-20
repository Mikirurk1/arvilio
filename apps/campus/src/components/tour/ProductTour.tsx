'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { useActiveRoleKey } from '../../lib/active-user';
import { useOptionalAuth } from '../../lib/auth-context';
import { Button } from '../ui';
import { Mascot } from '../mascot/Mascot';
import { useArvi } from '../mascot/useArvi';
import { useArviSound } from '../mascot/useArviSound';
import { useArviVoice } from '../mascot/useArviVoice';
import { getTourChapters, getHelpSteps, getFullProductTourSteps, resolveTourTrack, resolveHelpCmsTrackId, FIRST_WORDS_CMS_TRACK_ID } from './tracks';
import { defaultSfxForPose, type TourChapter, type TourStep } from './tracks/types';
import {
  placeTourCard,
  type SpotlightRect,
  type TourArrowSide,
  type TourCardPlacement,
} from './tour-placement';
import {
  isQuestActionSatisfied,
  TOUR_QUEST_SIGNAL_EVENT,
} from './tour-quest-detect';
import { measureTourTarget, scrollTourTargetIntoView } from './tour-target';
import {
  allChaptersResolved,
  chapterStatus,
  clearChapterProgress,
  clearChapterStatus,
  readChapterProgress,
  setChapterStatus,
  type ChapterProgressMap,
} from './tour-chapter-progress';
import {
  collectOpenDialogAnchorIds,
  collectVisiblePageAnchorIds,
  contextualEmptyStep,
  filterHelpStepsForPage,
  resolveLevelAIndexAfterNavigation,
} from './tour-context';
import { shouldSoftNavTourStep } from './tour-navigate';
import { isLearningModeOn } from './learning-mode';
import {
  hasBootstrappedProductTour,
  markBootstrappedProductTour,
  setProductTourSessionActive,
  isProductTourSessionActive,
  readProductTourCursor,
  writeProductTourCursor,
} from './tour-session';
import {
  getVocabFirstWordsSteps,
  markVocabFirstWordsGuideDone,
  TOUR_FIRST_WORDS_EVENT,
} from './vocab-first-words';
import { useSchoolGroupLessons } from '../../hooks/use-school-group-lessons';
import { mergeTourCopy, useCampusI18n, useCampusT } from '../../lib/cms';
import type { CampusTour } from '../../lib/cms';
import { replaceLocaleInPath, stripLocalePrefix } from '@pkg/types';
import styles from './ProductTour.module.scss';

export const TOUR_REPLAY_EVENT = 'arvilio:tour-replay';
/** Header “?” — page Help encyclopedia without resetting tourCompletedAt. */
export const TOUR_CONTEXTUAL_REPLAY_EVENT = 'arvilio:tour-contextual-replay';

export type TourContextualReplayDetail = {
  pathname?: string;
};

export type ContextualTourKind = 'help' | 'first-words';

const ARROW_CLASS: Record<TourArrowSide, string> = {
  left: styles.arrowLeft,
  right: styles.arrowRight,
  top: styles.arrowTop,
  bottom: styles.arrowBottom,
};

type TourPhase = 'A' | 'hub' | 'chapter';

/**
 * First-login product tour (role tracks). Level A spotlight map → chapter hub →
 * soft scenario chapters. Replay: Profile → Account.
 */
export function ProductTour() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const firstLoginStartedRef = useRef(false);
  const appPath = stripLocalePrefix(pathname || '/').pathname || '/';
  const appPathRef = useRef(appPath);
  appPathRef.current = appPath;
  /** Chapter auto-advance: satisfied-on-enter per step key. */
  const chapterEnterSatisfiedRef = useRef<Map<string, boolean>>(new Map());
  const chapterAutoAdvancedRef = useRef<Set<string>>(new Set());
  const advanceChapterStepRef = useRef<(completed: boolean) => void>(() => undefined);
  const onOnboardingRoute =
    appPath === '/onboarding' || appPath.startsWith('/onboarding/');
  const role = useActiveRoleKey();
  const auth = useOptionalAuth();
  const userId = auth?.user?.id ?? 'anon';
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const filters = useMemo(
    () => ({ groupLessonsEnabled }),
    [groupLessonsEnabled],
  );
  const tourTrack = useMemo(() => resolveTourTrack(role), [role]);
  const helpCmsTrackId = useMemo(() => resolveHelpCmsTrackId(role), [role]);
  const [cmsTour, setCmsTour] = useState<CampusTour | null>(null);
  const [cmsHelpTour, setCmsHelpTour] = useState<CampusTour | null>(null);
  const [cmsFirstWordsTour, setCmsFirstWordsTour] = useState<CampusTour | null>(null);
  useEffect(() => {
    let cancelled = false;
    const localeParam = locale === 'uk' ? 'uk' : 'en';
    const fetchTour = (trackId: string) => {
      const url = new URL('/cms-proxy/tours', window.location.origin);
      url.searchParams.set('locale', localeParam);
      url.searchParams.set('trackId', trackId);
      return fetch(url.toString(), { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { tour?: CampusTour | null } | null) => data?.tour ?? null)
        .catch(() => null);
    };
    const levelAId = tourTrack === 'admin_platform' ? 'adminPlatform' : tourTrack;
    void Promise.all([
      fetchTour(levelAId),
      fetchTour(helpCmsTrackId),
      fetchTour(FIRST_WORDS_CMS_TRACK_ID),
    ]).then(([levelA, help, firstWords]) => {
      if (cancelled) return;
      setCmsTour(levelA);
      setCmsHelpTour(help);
      setCmsFirstWordsTour(firstWords);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, tourTrack, helpCmsTrackId]);

  const levelASteps = useMemo(() => {
    const structural = getFullProductTourSteps(role, filters);
    // Overlay Level A + Help CMS copy (welcome/done from Level A track; sections from Help).
    return mergeTourCopy(mergeTourCopy(structural, cmsTour), cmsHelpTour);
  }, [role, filters, cmsTour, cmsHelpTour]);
  /** Header “?” — Help encyclopedia (§4.13); CMS overlays title/body/voiceSrc. */
  const helpSourceSteps = useMemo(
    () => mergeTourCopy(getHelpSteps(role, filters), cmsHelpTour),
    [role, filters, cmsHelpTour],
  );
  const firstWordsSourceSteps = useMemo(
    () => mergeTourCopy(getVocabFirstWordsSteps(), cmsFirstWordsTour),
    [cmsFirstWordsTour],
  );
  const chapters = useMemo((): TourChapter[] => {
    const raw = getTourChapters(role, filters);
    return raw.map((ch) => ({
      ...ch,
      steps: mergeTourCopy(ch.steps, cmsTour),
    }));
  }, [role, filters, cmsTour]);

  const { setSlotVisible } = useArvi();
  const { muted, toggleMute, play, ready: soundReady } = useArviSound();
  const { playVoice, stopVoice } = useArviVoice({ muted });
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<TourPhase>('A');
  const [index, setIndex] = useState(0);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chapterStepIndex, setChapterStepIndex] = useState(0);
  const [closing, setClosing] = useState(false);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [placement, setPlacement] = useState<TourCardPlacement | null>(null);
  const [signaledIds, setSignaledIds] = useState<Set<string>>(() => new Set());
  const [chapterProgress, setChapterProgress] = useState<ChapterProgressMap>({});
  /** When set, Level A UI walks only these steps (Header help / first-words). */
  const [contextualSteps, setContextualSteps] = useState<TourStep[] | null>(null);
  const [contextualKind, setContextualKind] = useState<ContextualTourKind | null>(null);
  const contextualMode = contextualSteps != null;

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) ?? null,
    [chapters, activeChapterId],
  );
  const chapterSteps = activeChapter?.steps ?? [];
  const isQuestPhase = phase === 'chapter';
  const isHubPhase = phase === 'hub';

  const activeLevelASteps = contextualMode ? contextualSteps! : levelASteps;

  const step = isHubPhase
    ? null
    : isQuestPhase
      ? chapterSteps[chapterStepIndex]
      : activeLevelASteps[index];

  const activeIndex = isQuestPhase ? chapterStepIndex : index;
  const activeStepsLength = isQuestPhase ? chapterSteps.length : activeLevelASteps.length;
  const isFirst = !isQuestPhase && !isHubPhase && index === 0;
  const isLast = !isQuestPhase && !isHubPhase && index === activeLevelASteps.length - 1;
  const isChapterLast =
    isQuestPhase && chapterStepIndex === chapterSteps.length - 1;

  const questSatisfied =
    isQuestPhase &&
    step?.requiresAction != null &&
    isQuestActionSatisfied(
      step.requiresAction.detects,
      pathname,
      signaledIds,
      step.requiresAction.id,
    );

  const refreshSpotlight = useCallback(() => {
    if (isHubPhase || !step) {
      setSpotlight(null);
      setPlacement(null);
      return;
    }
    const rect = measureTourTarget({
      anchorId: step.anchorId,
      navHref: step.navHref,
    });
    setSpotlight(rect);
    if (rect && typeof window !== 'undefined') {
      setPlacement(
        placeTourCard(rect, { width: window.innerWidth, height: window.innerHeight }),
      );
    } else {
      setPlacement(null);
    }
  }, [step, isHubPhase]);

  useEffect(() => {
    if (phase === 'A' && index >= activeLevelASteps.length) setIndex(0);
    if (phase === 'chapter' && chapterStepIndex >= chapterSteps.length) {
      setChapterStepIndex(0);
    }
  }, [index, chapterStepIndex, activeLevelASteps.length, chapterSteps.length, phase]);

  useEffect(() => {
    if (!open) return;
    if (isHubPhase) {
      track({
        name: 'tour_step_viewed',
        stepIndex: 0,
        track: tourTrack,
        role,
        stepId: 'tour-hub',
      });
      return;
    }
    if (!step) return;
    if (isQuestPhase) {
      track({
        name: 'tour_quest_viewed',
        questIndex: activeIndex,
        track: tourTrack,
        role,
        questId: step.id,
      });
    } else {
      track({
        name: 'tour_step_viewed',
        stepIndex: activeIndex,
        track: tourTrack,
        role,
        stepId: step.id,
      });
    }
  }, [open, activeIndex, step, tourTrack, role, isQuestPhase, isHubPhase]);

  useEffect(() => {
    if (!open || isHubPhase || !step || !soundReady) return;
    play(step.sfx ?? defaultSfxForPose(step.pose));
    playVoice(step.voiceSrc);
    return () => stopVoice();
  }, [open, activeIndex, step, play, playVoice, stopVoice, soundReady, isHubPhase]);

  useEffect(() => {
    if (!open || !isHubPhase || !soundReady) return;
    play('greet');
  }, [open, isHubPhase, play, soundReady]);

  useEffect(() => {
    setSlotVisible(!open);
    return () => setSlotVisible(true);
  }, [open, setSlotVisible]);

  /** First-login and Profile Replay share the same full product-tour bootstrap. */
  const beginFullProductTour = useCallback(() => {
    if (onOnboardingRoute || levelASteps.length === 0) return;
    clearChapterProgress(tourTrack, userId);
    setChapterProgress({});
    setContextualSteps(null);
    setContextualKind(null);
    setPhase('A');
    setIndex(0);
    setActiveChapterId(null);
    setChapterStepIndex(0);
    setSignaledIds(new Set());
    setClosing(false);
    setOpen(true);
    setProductTourSessionActive(true);
    markBootstrappedProductTour(userId);
    firstLoginStartedRef.current = true;
    // Level A anchors live on dashboard first; Profile made early steps look like Help.
    if (appPathRef.current !== '/dashboard') {
      router.replace(replaceLocaleInPath('/dashboard', locale));
    }
  }, [onOnboardingRoute, levelASteps.length, tourTrack, userId, router, locale]);

  useEffect(() => {
    if (onOnboardingRoute || levelASteps.length === 0) return;
    if (firstLoginStartedRef.current) return;

    const resume = readProductTourCursor(userId);
    if (resume || hasBootstrappedProductTour(userId)) {
      firstLoginStartedRef.current = true;
      let active = true;
      apiClient
        .get<{ completed: boolean }>('/onboarding/tour')
        .then((state) => {
          if (!active || state.completed) return;
          if (resume) {
            setPhase(resume.phase);
            setIndex(resume.index);
            setActiveChapterId(resume.chapterId);
            setChapterStepIndex(resume.chapterStepIndex);
            setContextualSteps(null);
            setContextualKind(null);
          }
          setProductTourSessionActive(true);
          setOpen(true);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }

    let active = true;
    apiClient
      .get<{ completed: boolean }>('/onboarding/tour')
      .then((state) => {
        if (!active || state.completed || firstLoginStartedRef.current) return;
        firstLoginStartedRef.current = true;
        beginFullProductTour();
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [onOnboardingRoute, levelASteps.length, beginFullProductTour, userId]);

  useEffect(() => {
    if (!open) return;
    setChapterProgress(readChapterProgress(tourTrack, userId));
  }, [open, tourTrack, userId]);

  // Persist cursor so Soft-nav / Vocabulary does not restart the walk from step 0.
  useEffect(() => {
    if (!open || contextualMode) return;
    writeProductTourCursor({
      userId,
      phase,
      index,
      chapterId: activeChapterId,
      chapterStepIndex,
    });
  }, [open, contextualMode, userId, phase, index, activeChapterId, chapterStepIndex]);

  // Keep session gate in sync (blocks Vocabulary first-words hijack).
  useEffect(() => {
    if (open && !contextualMode) {
      setProductTourSessionActive(true);
    }
  }, [open, contextualMode]);

  useEffect(() => {
    const onReplay = () => beginFullProductTour();
    window.addEventListener(TOUR_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(TOUR_REPLAY_EVENT, onReplay);
  }, [beginFullProductTour]);

  // Soft auto-nav disabled — see shouldSoftNavTourStep (avoids Vocabulary remount storms).
  useEffect(() => {
    if (
      !shouldSoftNavTourStep({
        open,
        contextualMode,
        phase,
        step,
        appPath,
      })
    ) {
      return;
    }
    const href = step!.navHref!;
    router.replace(replaceLocaleInPath(href, locale));
  }, [open, contextualMode, phase, step, appPath, router, locale]);

  useEffect(() => {
    const onContextual = (event: Event) => {
      if (onOnboardingRoute || helpSourceSteps.length === 0) return;
      if (!isLearningModeOn()) return;
      const detail = (event as CustomEvent<TourContextualReplayDetail>).detail;
      const livePath =
        detail?.pathname ||
        (typeof window !== 'undefined' ? window.location.pathname : '') ||
        pathname;
      const modalAnchorIds = collectOpenDialogAnchorIds();
      const pageAnchorIds = collectVisiblePageAnchorIds();
      const filtered = filterHelpStepsForPage({
        steps: helpSourceSteps,
        pathname: livePath,
        modalAnchorIds,
        pageAnchorIds,
      });
      const steps =
        filtered.length > 0
          ? filtered
          : [
              contextualEmptyStep({
                title: t('tour.contextual.emptyTitle'),
                body: t('tour.contextual.emptyBody'),
              }),
            ];
      setContextualSteps(steps);
      setContextualKind('help');
      setPhase('A');
      setIndex(0);
      setActiveChapterId(null);
      setChapterStepIndex(0);
      setSignaledIds(new Set());
      setClosing(false);
      setOpen(true);
      track({
        name: 'tour_contextual_opened',
        track: tourTrack,
        role,
        stepId: steps[0]?.id ?? 'ctx-empty',
      });
    };
    window.addEventListener(TOUR_CONTEXTUAL_REPLAY_EVENT, onContextual);
    return () => window.removeEventListener(TOUR_CONTEXTUAL_REPLAY_EVENT, onContextual);
  }, [onOnboardingRoute, helpSourceSteps, pathname, tourTrack, role, t]);

  useEffect(() => {
    const onFirstWords = () => {
      if (onOnboardingRoute) return;
      if (!isLearningModeOn()) return;
      if (open) return;
      if (isProductTourSessionActive()) return;
      const steps = firstWordsSourceSteps;
      setContextualSteps(steps);
      setContextualKind('first-words');
      setPhase('A');
      setIndex(0);
      setActiveChapterId(null);
      setChapterStepIndex(0);
      setSignaledIds(new Set());
      setClosing(false);
      setOpen(true);
      track({
        name: 'tour_contextual_opened',
        track: tourTrack,
        role,
        stepId: steps[0]?.id ?? 'first-words',
      });
    };
    window.addEventListener(TOUR_FIRST_WORDS_EVENT, onFirstWords);
    return () => window.removeEventListener(TOUR_FIRST_WORDS_EVENT, onFirstWords);
  }, [onOnboardingRoute, open, tourTrack, role, firstWordsSourceSteps]);

  useEffect(() => {
    if (!open) return;
    const onSignal = (event: Event) => {
      const detail = (event as CustomEvent<{ questId?: string; eventId?: string }>).detail;
      if (!detail) return;
      setSignaledIds((prev) => {
        const next = new Set(prev);
        if (detail.questId) next.add(detail.questId);
        if (detail.eventId) next.add(detail.eventId);
        return next;
      });
    };
    window.addEventListener(TOUR_QUEST_SIGNAL_EVENT, onSignal);
    return () => window.removeEventListener(TOUR_QUEST_SIGNAL_EVENT, onSignal);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    refreshSpotlight();
    const onLayout = () => refreshSpotlight();
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);
    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
    };
  }, [open, refreshSpotlight]);

  // Bring the step target into view, then remeasure spotlight after scroll settles.
  useEffect(() => {
    if (!open || isHubPhase || !step) return;
    const scrolled = scrollTourTargetIntoView({
      anchorId: step.anchorId,
      navHref: step.navHref,
    });
    if (!scrolled) {
      refreshSpotlight();
      return;
    }
    const settleMs =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : 420;
    const timer = window.setTimeout(() => refreshSpotlight(), settleMs);
    const onScrollEnd = () => refreshSpotlight();
    window.addEventListener('scrollend', onScrollEnd, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scrollend', onScrollEnd, true);
    };
  }, [open, isHubPhase, step?.id, step?.anchorId, step?.navHref, pathname, refreshSpotlight]);

  useEffect(() => {
    if (!open || !isQuestPhase) return;
    const tick = () => refreshSpotlight();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [open, isQuestPhase, pathname, refreshSpotlight]);

  // Level A: after user clicks nav (Practice, etc.), advance to matching step.
  useEffect(() => {
    if (!open || phase !== 'A' || !pathname) return;
    const next = resolveLevelAIndexAfterNavigation({
      steps: activeLevelASteps,
      index,
      pathname,
    });
    if (next == null || next === index) return;
    setIndex(next);
  }, [open, phase, pathname, index, activeLevelASteps]);

  async function finishTour(skipped = false, lastStepId?: string) {
    setClosing(true);
    setOpen(false);
    const wasContextual = contextualMode;
    const kind = contextualKind;
    setContextualSteps(null);
    setContextualKind(null);
    if (wasContextual) {
      if (kind === 'first-words') {
        markVocabFirstWordsGuideDone();
      }
      track({
        name: skipped ? 'tour_contextual_skipped' : 'tour_contextual_closed',
        track: tourTrack,
        role,
        stepId: lastStepId ?? step?.id ?? 'ctx',
      });
      return;
    }
    setProductTourSessionActive(false);
    await apiClient.post('/onboarding/tour/complete').catch(() => undefined);
    if (skipped) {
      track({
        name: 'tour_skipped',
        stepIndex: activeIndex,
        track: tourTrack,
        role,
        stepId: lastStepId ?? step?.id ?? 'tour-hub',
      });
    } else {
      track({
        name: 'tour_completed',
        track: tourTrack,
        role,
        stepId: lastStepId ?? step?.id ?? 'tour-hub',
      });
    }
  }

  function enterHub() {
    if (contextualMode) {
      void finishTour(false, 'ctx-finish');
      return;
    }
    if (chapters.length === 0) {
      void finishTour(false, 'tour-hub');
      return;
    }
    setPhase('hub');
    setActiveChapterId(null);
    setChapterStepIndex(0);
    setSpotlight(null);
    setPlacement(null);
    setSignaledIds(new Set());
  }

  function startChapter(chapter: TourChapter) {
    track({
      name: 'tour_chapter_started',
      track: tourTrack,
      role,
      chapterId: chapter.id,
    });
    setActiveChapterId(chapter.id);
    setChapterStepIndex(0);
    setSignaledIds(new Set());
    setPhase('chapter');
  }

  /** Tour v3.1 — redo a done/skipped chapter from the hub. */
  function replayChapter(chapter: TourChapter) {
    const next = clearChapterStatus(tourTrack, userId, chapter.id);
    setChapterProgress(next);
    track({
      name: 'tour_chapter_replayed',
      track: tourTrack,
      role,
      chapterId: chapter.id,
    });
    startChapter(chapter);
  }

  function onHubChapterAction(chapter: TourChapter) {
    const status = chapterStatus(chapterProgress, chapter.id);
    if (status === 'todo') {
      startChapter(chapter);
      return;
    }
    replayChapter(chapter);
  }

  function returnToHub(chapterId: string, status: 'done' | 'skipped') {
    const next = setChapterStatus(tourTrack, userId, chapterId, status);
    setChapterProgress(next);
    track({
      name: status === 'done' ? 'tour_chapter_completed' : 'tour_chapter_skipped',
      track: tourTrack,
      role,
      chapterId,
    });
    play(status === 'done' ? 'celebrate' : 'wave');
    setPhase('hub');
    setActiveChapterId(null);
    setChapterStepIndex(0);
    setSignaledIds(new Set());
    setSpotlight(null);
    setPlacement(null);

    const ids = chapters.map((c) => c.id);
    if (allChaptersResolved(ids, next)) {
      void finishTour(false, chapterId);
    }
  }

  function advanceChapterStep(completed: boolean) {
    if (!step || !activeChapter) return;
    if (completed) {
      track({
        name: 'tour_quest_completed',
        questIndex: chapterStepIndex,
        track: tourTrack,
        role,
        questId: step.id,
      });
    } else {
      track({
        name: 'tour_quest_skipped',
        questIndex: chapterStepIndex,
        track: tourTrack,
        role,
        questId: step.id,
      });
    }
    if (isChapterLast) {
      returnToHub(activeChapter.id, completed ? 'done' : 'skipped');
      return;
    }
    setChapterStepIndex((i) => i + 1);
    setSignaledIds(new Set());
  }
  advanceChapterStepRef.current = advanceChapterStep;

  /**
   * Mid-chapter auto-advance when detect becomes true during the step (click System).
   * - Already true on enter → Continue only (no flash-skip).
   * - Last step → never auto (user confirms after opening Payments tab).
   * - Reschedule after effect cleanup so React Strict Mode does not drop the timer.
   */
  useEffect(() => {
    if (!open || phase !== 'chapter') {
      chapterEnterSatisfiedRef.current.clear();
      chapterAutoAdvancedRef.current.clear();
      return;
    }
    if (!step) return;

    const key = `${activeChapter?.id ?? ''}:${chapterStepIndex}:${step.id}`;
    const enterMap = chapterEnterSatisfiedRef.current;
    if (!enterMap.has(key)) {
      enterMap.set(key, questSatisfied);
    }
    if (enterMap.get(key) === true) return;
    if (!questSatisfied) return;
    if (isChapterLast) return;
    if (chapterAutoAdvancedRef.current.has(key)) return;

    const timer = window.setTimeout(() => {
      chapterAutoAdvancedRef.current.add(key);
      advanceChapterStepRef.current(true);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    open,
    phase,
    questSatisfied,
    step?.id,
    chapterStepIndex,
    activeChapter?.id,
    isChapterLast,
  ]);

  function skipEntireChapter() {
    if (!activeChapter) return;
    returnToHub(activeChapter.id, 'skipped');
  }

  function onPrimaryAction() {
    if (isQuestPhase) {
      if (questSatisfied) advanceChapterStep(true);
      return;
    }
    if (isLast) {
      if (contextualMode) {
        void finishTour(false);
        return;
      }
      if (chapters.length > 0) {
        enterHub();
        return;
      }
      void finishTour(false);
      return;
    }
    setIndex((i) => i + 1);
  }

  function onSkipAll() {
    if (isQuestPhase) {
      skipEntireChapter();
      return;
    }
    void finishTour(true, isHubPhase ? 'tour-hub' : step?.id);
  }

  const chaptersDoneCount = chapters.filter((c) => {
    const s = chapterStatus(chapterProgress, c.id);
    return s === 'done' || s === 'skipped';
  }).length;

  const anchored = Boolean(spotlight && placement) && !isHubPhase;
  const progressLabel = isHubPhase
    ? t('tour.hub.progress', { done: String(chaptersDoneCount), total: String(chapters.length) })
    : isQuestPhase
      ? t('tour.tryItProgress', {
          current: String(activeIndex + 1),
          total: String(activeStepsLength),
        })
      : contextualMode
        ? t(
            contextualKind === 'first-words'
              ? 'tour.firstWordsProgress'
              : 'tour.helpProgress',
            {
              current: String(activeIndex + 1),
              total: String(activeStepsLength),
            },
          )
        : `${activeIndex + 1} / ${activeStepsLength}`;

  if (!open) return null;
  if (!isHubPhase && (!step || activeLevelASteps.length === 0)) return null;
  if (isHubPhase && chapters.length === 0) return null;

  const cardTitle = isHubPhase ? t('tour.hub.title') : step!.title;
  const cardBody = isHubPhase ? t('tour.hub.body') : step!.body;
  const cardPose = isHubPhase ? 'greet' : step!.pose;
  const cardArea = isHubPhase
    ? undefined
    : isQuestPhase
      ? (step!.area ?? activeChapter?.title)
      : step!.area;

  const tourModeAttr = contextualMode
    ? contextualKind === 'first-words'
      ? 'first-words'
      : 'help'
    : isHubPhase
      ? 'hub'
      : isQuestPhase
        ? 'chapter'
        : 'level-a';

  return (
    <div
      className={`${styles.overlay} ${anchored ? styles.overlayAnchored : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Product tour"
      data-tour-phase={phase}
      data-tour-mode={tourModeAttr}
    >
      {spotlight && !isHubPhase ? (
        <div
          className={styles.spotlight}
          data-tour-spotlight
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          aria-hidden
        />
      ) : null}

      <div
        className={`${styles.card} ${anchored ? styles.cardAnchored : ''} ${isHubPhase ? styles.cardHub : ''}`}
        style={
          anchored && placement
            ? { top: placement.top, left: placement.left }
            : undefined
        }
        data-tour-card
        data-tour-arrow={placement?.arrow ?? 'none'}
      >
        {anchored && placement ? (
          <span
            className={`${styles.arrow} ${ARROW_CLASS[placement.arrow]}`}
            aria-hidden
          />
        ) : null}
        <div className={styles.mascot} data-mascot aria-hidden>
          <Mascot pose={cardPose} size={56} />
        </div>
        <div className={styles.body}>
          <div className={styles.cardTop}>
            <div className={styles.progress}>
              {progressLabel}
              {cardArea ? <span className={styles.area}> · {cardArea}</span> : null}
            </div>
            <Button
              variant="bare"
              type="button"
              className={styles.muteBtn}
              aria-pressed={muted}
              aria-label={muted ? 'Unmute tour sounds' : 'Mute tour sounds'}
              onClick={toggleMute}
            >
              {muted ? 'Unmute' : 'Mute'}
            </Button>
          </div>
          <h2 className={styles.title}>{cardTitle}</h2>
          <p className={styles.text}>{cardBody}</p>

          {isHubPhase ? (
            <ul className={styles.chapterList} data-tour-hub>
              {chapters.map((ch) => {
                const status = chapterStatus(chapterProgress, ch.id);
                const isTodo = status === 'todo';
                const actionLabel = isTodo
                  ? t('tour.hub.status.todo')
                  : t('tour.hub.replay');
                const statusHint =
                  status === 'done'
                    ? t('tour.hub.status.done')
                    : status === 'skipped'
                      ? t('tour.hub.status.skipped')
                      : null;
                return (
                  <li key={ch.id} className={styles.chapterItem}>
                    <div className={styles.chapterCopy}>
                      <span className={styles.chapterTitle}>
                        {ch.title}
                        {statusHint ? (
                          <span className={styles.chapterStatusBadge} data-status={status}>
                            {' '}
                            · {statusHint}
                          </span>
                        ) : null}
                      </span>
                      <span className={styles.chapterBlurb}>{ch.body}</span>
                    </div>
                    <Button
                      type="button"
                      variant={isTodo ? 'primary' : 'ghost'}
                      disabled={closing}
                      data-tour-chapter={ch.id}
                      data-tour-chapter-status={status}
                      data-tour-chapter-action={isTodo ? 'start' : 'replay'}
                      onClick={() => onHubChapterAction(ch)}
                    >
                      {actionLabel}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {isQuestPhase && step?.requiresAction ? (
            <p
              className={`${styles.hint} ${questSatisfied ? styles.hintDone : ''}`}
              data-tour-quest-hint
            >
              {questSatisfied ? t('tour.questDetected') : step.requiresAction.hint}
            </p>
          ) : null}

          <div className={styles.actions}>
            {isHubPhase ? (
              <Button variant="ghost" disabled={closing} onClick={() => void finishTour(true, 'tour-hub')}>
                {t('tour.hub.finishLater')}
              </Button>
            ) : isQuestPhase ? (
              <div className={styles.chapterSkips}>
                <Button variant="ghost" disabled={closing} onClick={() => advanceChapterStep(false)}>
                  {step?.softSkipLabel ?? t('tour.skip')}
                </Button>
                <Button variant="ghost" disabled={closing} onClick={skipEntireChapter}>
                  {t('tour.chapter.skip')}
                </Button>
              </div>
            ) : (
              <div className={styles.chapterSkips}>
                <Button variant="ghost" disabled={closing} onClick={onSkipAll}>
                  {t('tour.skip')}
                </Button>
                {!contextualMode && chapters.length > 0 ? (
                  <Button
                    variant="ghost"
                    disabled={closing}
                    data-tour-skip-to-actions
                    onClick={() => enterHub()}
                  >
                    {t('tour.skipToActions')}
                  </Button>
                ) : null}
              </div>
            )}
            <div className={styles.nav}>
              {isQuestPhase ? (
                <>
                  <Button
                    variant="default"
                    disabled={closing}
                    onClick={() => {
                      setPhase('hub');
                      setActiveChapterId(null);
                      setChapterStepIndex(0);
                      setSignaledIds(new Set());
                    }}
                  >
                    {t('tour.chapter.backToHub')}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={closing || !questSatisfied}
                    onClick={onPrimaryAction}
                  >
                    {isChapterLast ? t('tour.finish') : t('onboarding.next')}
                  </Button>
                </>
              ) : isHubPhase ? null : (
                <>
                  {!isFirst ? (
                    <Button variant="default" disabled={closing} onClick={() => setIndex((i) => i - 1)}>
                      {t('tour.back')}
                    </Button>
                  ) : null}
                  {isLast ? (
                    <Button variant="primary" disabled={closing} onClick={onPrimaryAction}>
                      {contextualMode
                        ? t('tour.finish')
                        : chapters.length > 0
                          ? t('onboarding.next')
                          : t('tour.finish')}
                    </Button>
                  ) : (
                    <Button variant="primary" disabled={closing} onClick={onPrimaryAction}>
                      {t('tour.next')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
