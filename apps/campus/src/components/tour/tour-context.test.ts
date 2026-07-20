import {
  filterHelpStepsForPage,
  filterStepsForContext,
  normalizeHelpPathname,
  normalizeTourPathname,
  pathMatchesNavHref,
  resolveLevelAIndexAfterNavigation,
} from './tour-context';
import type { TourStep } from './tracks/types';

const sample: TourStep[] = [
  {
    id: 'tea-welcome',
    title: 'Welcome',
    body: 'Hi',
    pose: 'greet',
  },
  {
    id: 'tea-calendar',
    title: 'Calendar',
    body: 'Plan',
    area: 'Calendar',
    navHref: '/calendar',
    pose: 'point',
  },
  {
    id: 'tea-calendar-create',
    title: 'New lesson',
    body: 'Create',
    area: 'Calendar',
    navHref: '/calendar',
    anchorId: 'header-create-lesson',
    pose: 'point',
  },
  {
    id: 'tea-materials',
    title: 'Materials',
    body: 'Lib',
    navHref: '/materials',
    anchorId: 'materials-create',
    pose: 'point',
  },
  {
    id: 'tea-done',
    title: 'Done',
    body: 'Bye',
    pose: 'celebrate',
  },
  {
    id: 'tea-lesson-modal-tip',
    title: 'Lesson modal',
    body: 'Setup',
    anchorId: 'lesson-modal',
    pose: 'point',
  },
];

describe('tour-context', () => {
  it('normalizes locale-prefixed paths', () => {
    expect(normalizeTourPathname('/uk/calendar')).toBe('/calendar');
    expect(normalizeTourPathname('/en/students/abc')).toBe('/students/abc');
  });

  it('aliases practice vocabulary and quiz paths for Help', () => {
    expect(normalizeHelpPathname('/uk/practice/vocabulary')).toBe('/vocabulary');
    expect(normalizeHelpPathname('/practice/quiz')).toBe('/quiz');
    expect(normalizeHelpPathname('/practice')).toBe('/practice');
  });

  it('matches navHref including nested routes', () => {
    expect(pathMatchesNavHref('/students/x', '/students')).toBe(true);
    expect(pathMatchesNavHref('/calendar', '/students')).toBe(false);
  });

  it('filters calendar steps by pathname and excludes welcome/done', () => {
    const filtered = filterStepsForContext({
      steps: sample,
      pathname: '/uk/calendar',
    });
    expect(filtered.map((s) => s.id)).toEqual(['tea-calendar', 'tea-calendar-create']);
  });

  it('prefers modal anchors over page nav matches', () => {
    const filtered = filterStepsForContext({
      steps: sample,
      pathname: '/calendar',
      modalAnchorIds: ['lesson-modal'],
    });
    expect(filtered.map((s) => s.id)).toEqual(['tea-lesson-modal-tip']);
  });

  it('matches page anchors on dashboard-like pages', () => {
    const filtered = filterStepsForContext({
      steps: sample,
      pathname: '/materials',
      pageAnchorIds: ['materials-create'],
    });
    expect(filtered.map((s) => s.id)).toEqual(['tea-materials']);
  });

  it('help filter ignores shared chrome anchors from other routes', () => {
    const filtered = filterHelpStepsForPage({
      steps: sample,
      pathname: '/dashboard',
      pageAnchorIds: ['header-create-lesson'],
    });
    expect(filtered.map((s) => s.id)).toEqual([]);
  });

  it('help filter prefers longest navHref on nested practice paths', () => {
    const steps: TourStep[] = [
      {
        id: 'hub',
        title: 'Hub',
        body: 'x',
        navHref: '/practice',
        pose: 'point',
      },
      {
        id: 'speaking',
        title: 'Speaking',
        body: 'x',
        navHref: '/practice/speaking',
        pose: 'point',
      },
    ];
    expect(
      filterHelpStepsForPage({ steps, pathname: '/practice/speaking' }).map((s) => s.id),
    ).toEqual(['speaking']);
    expect(
      filterHelpStepsForPage({ steps, pathname: '/practice' }).map((s) => s.id),
    ).toEqual(['hub']);
  });

  it('help filter aliases /practice/vocabulary to vocab tips not hub', () => {
    const steps: TourStep[] = [
      {
        id: 'hub',
        title: 'Hub',
        body: 'x',
        navHref: '/practice',
        anchorId: 'practice-hub-cards',
        pose: 'point',
      },
      {
        id: 'modes',
        title: 'Modes',
        body: 'x',
        navHref: '/vocabulary',
        anchorId: 'vocab-mode-toggle',
        pose: 'point',
      },
    ];
    expect(
      filterHelpStepsForPage({
        steps,
        pathname: '/uk/practice/vocabulary',
      }).map((s) => s.id),
    ).toEqual(['modes']);
  });

  it('help filter keeps only visible vocab anchors during play', () => {
    const steps: TourStep[] = [
      {
        id: 'add',
        title: 'Add',
        body: 'x',
        navHref: '/vocabulary',
        anchorId: 'vocab-add-word',
        pose: 'point',
      },
      {
        id: 'question',
        title: 'Q',
        body: 'x',
        navHref: '/vocabulary',
        anchorId: 'vocab-play-question',
        pose: 'point',
      },
      {
        id: 'options',
        title: 'Opts',
        body: 'x',
        navHref: '/vocabulary',
        anchorId: 'vocab-play-options',
        pose: 'point',
      },
    ];
    expect(
      filterHelpStepsForPage({
        steps,
        pathname: '/practice/vocabulary',
        pageAnchorIds: ['vocab-play-question', 'vocab-play-options', 'vocab-mode-toggle'],
      }).map((s) => s.id),
    ).toEqual(['question', 'options']);
  });

  it('adminPlatform short track has no calendar tips (caller should use admin map)', () => {
    const platformOnly: TourStep[] = [
      {
        id: 'sup-welcome',
        title: 'Hi',
        body: 'x',
        pose: 'greet',
      },
      {
        id: 'sup-system',
        title: 'System',
        body: 'x',
        navHref: '/system',
        pose: 'point',
      },
    ];
    expect(
      filterStepsForContext({ steps: platformOnly, pathname: '/dashboard' }).map((s) => s.id),
    ).toEqual([]);
  });
});

describe('resolveLevelAIndexAfterNavigation', () => {
  const walk: TourStep[] = [
    { id: 'stu-welcome', title: 'Hi', body: 'x', pose: 'greet' },
    {
      id: 'help-lessons',
      title: 'Lessons',
      body: 'x',
      navHref: '/lessons',
      pose: 'point',
    },
    {
      id: 'help-practice-hub',
      title: 'Practice',
      body: 'x',
      navHref: '/practice',
      pose: 'point',
    },
    {
      id: 'help-practice-stats',
      title: 'Stats',
      body: 'x',
      navHref: '/practice',
      pose: 'point',
    },
    {
      id: 'help-vocab',
      title: 'Vocab',
      body: 'x',
      navHref: '/vocabulary',
      pose: 'point',
    },
    { id: 'stu-done', title: 'Done', body: 'x', pose: 'celebrate' },
  ];

  it('jumps from lessons tip to practice tip after Practice click', () => {
    expect(
      resolveLevelAIndexAfterNavigation({
        steps: walk,
        index: 1,
        pathname: '/uk/practice',
      }),
    ).toBe(2);
  });

  it('stays on practice tip when already matching (same-page sections)', () => {
    expect(
      resolveLevelAIndexAfterNavigation({
        steps: walk,
        index: 2,
        pathname: '/practice',
      }),
    ).toBeNull();
  });

  it('jumps to vocabulary tips when opening Vocabulary from practice card tip', () => {
    expect(
      resolveLevelAIndexAfterNavigation({
        steps: walk,
        index: 2,
        pathname: '/practice/vocabulary',
      }),
    ).toBe(4);
  });

  it('does not jump backward', () => {
    expect(
      resolveLevelAIndexAfterNavigation({
        steps: walk,
        index: 4,
        pathname: '/lessons',
      }),
    ).toBeNull();
  });
});
