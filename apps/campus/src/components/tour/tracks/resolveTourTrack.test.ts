import {
  getTourChapters,
  getTourQuestSteps,
  getTourSteps,
  getFullProductTourSteps,
  getHelpSteps,
  resolveTourTrack,
  TOUR_TRACKS,
} from './index';

const STUDENT_FORBIDDEN = [
  '/billing',
  '/staff',
  '/materials',
  '/students',
  '/system',
  '/finance',
  '/admin',
] as const;

describe('resolveTourTrack', () => {
  it('maps auth roles to tracks', () => {
    expect(resolveTourTrack('student')).toBe('student');
    expect(resolveTourTrack('teacher')).toBe('teacher');
    expect(resolveTourTrack('admin')).toBe('admin');
    // Campus school app: full admin map (not 4-step admin_platform stub)
    expect(resolveTourTrack('super_admin')).toBe('admin');
  });
});

describe('getTourSteps / TOUR_TRACKS', () => {
  it('exposes a non-empty Level A list per track', () => {
    for (const track of Object.keys(TOUR_TRACKS) as (keyof typeof TOUR_TRACKS)[]) {
      expect(TOUR_TRACKS[track].length).toBeGreaterThan(0);
    }
  });

  it('uses navHref paths that start with / when set', () => {
    for (const steps of Object.values(TOUR_TRACKS)) {
      for (const step of steps) {
        if (step.navHref != null) {
          expect(step.navHref.startsWith('/')).toBe(true);
        }
        expect(step.pose).toBeTruthy();
        expect(step.id).toBeTruthy();
      }
    }
  });

  it('student track never spotlights admin/teacher-only routes', () => {
    const hrefs = getTourSteps('student')
      .map((s) => s.navHref)
      .filter((h): h is string => Boolean(h));
    for (const forbidden of STUDENT_FORBIDDEN) {
      expect(hrefs).not.toContain(forbidden);
    }
    expect(hrefs).toContain('/payment');
    expect(hrefs).toContain('/practice');
    expect(getTourSteps('student').length).toBeGreaterThanOrEqual(14);
  });

  it('teacher track never spotlights payment or billing', () => {
    const hrefs = getTourSteps('teacher')
      .map((s) => s.navHref)
      .filter((h): h is string => Boolean(h));
    expect(hrefs).not.toContain('/payment');
    expect(hrefs).not.toContain('/billing');
    expect(hrefs).toContain('/materials');
    expect(hrefs).toContain('/students');
    expect(getTourSteps('teacher').length).toBeGreaterThanOrEqual(12);
  });

  it('admin track includes system and billing', () => {
    const hrefs = getTourSteps('admin')
      .map((s) => s.navHref)
      .filter((h): h is string => Boolean(h));
    expect(hrefs).toContain('/system');
    expect(hrefs).toContain('/billing');
    expect(hrefs).not.toContain('/payment');
    expect(getTourSteps('admin').length).toBeGreaterThanOrEqual(14);
  });

  it('super_admin uses full admin Level A (not short platform stub)', () => {
    expect(getTourSteps('super_admin').map((s) => s.id)).toEqual(
      getTourSteps('admin').map((s) => s.id),
    );
    expect(getTourSteps('super_admin').length).toBeGreaterThanOrEqual(14);
  });

  it('omits groupLessons steps when the feature is off', () => {
    const without = getTourSteps('teacher', { groupLessonsEnabled: false }).map((s) => s.id);
    const withGroups = getTourSteps('teacher', { groupLessonsEnabled: true }).map((s) => s.id);
    expect(without).not.toContain('tea-groups');
    expect(withGroups).toContain('tea-groups');
  });

  it('student vocabulary step prefers a practice-card-vocabulary anchor', () => {
    const vocab = getTourSteps('student').find((s) => s.id === 'stu-vocabulary');
    expect(vocab?.anchorId).toBe('practice-card-vocabulary');
  });
});

describe('getFullProductTourSteps', () => {
  it('is welcome + all Help sections + done (longer than short Level A)', () => {
    const full = getFullProductTourSteps('student');
    const help = getHelpSteps('student');
    expect(full[0]?.id).toBe('stu-welcome');
    expect(full[full.length - 1]?.id).toBe('stu-done');
    expect(full.length).toBe(1 + help.length + 1);
    expect(full.length).toBeGreaterThan(getTourSteps('student').length);
    expect(full.some((s) => s.id.startsWith('help-stu-dash-'))).toBe(true);
    expect(full.some((s) => s.id === 'help-stu-payment-balance')).toBe(true);
  });

  it('walks multiple pages section-by-section for admin', () => {
    const full = getFullProductTourSteps('admin');
    expect(full[0]?.id).toBe('adm-welcome');
    expect(full[full.length - 1]?.id).toBe('adm-done');
    expect(full.length).toBeGreaterThanOrEqual(getHelpSteps('admin').length);
    const hrefs = full.map((s) => s.navHref).filter(Boolean);
    expect(hrefs).toContain('/dashboard');
    expect(hrefs).toContain('/system');
    expect(hrefs).toContain('/billing');
  });
});

describe('getTourChapters', () => {
  it('returns chapters for student, teacher, admin; super_admin shares admin', () => {
    expect(getTourChapters('student').length).toBeGreaterThanOrEqual(5);
    expect(getTourChapters('teacher').length).toBeGreaterThanOrEqual(6);
    expect(getTourChapters('admin').length).toBeGreaterThanOrEqual(6);
    expect(getTourChapters('super_admin').map((c) => c.id)).toEqual(
      getTourChapters('admin').map((c) => c.id),
    );
    expect(getTourChapters('student')[0]?.id).toBe('shared-ch-vocab-add');
    expect(getTourChapters('teacher')[0]?.id).toBe('shared-ch-vocab-add');
    expect(getTourChapters('admin')[0]?.id).toBe('shared-ch-vocab-add');
  });

  it('chapter steps are Level B with requiresAction', () => {
    for (const role of ['student', 'teacher', 'admin'] as const) {
      for (const ch of getTourChapters(role)) {
        expect(ch.id).toBeTruthy();
        expect(ch.steps.length).toBeGreaterThan(0);
        for (const step of ch.steps) {
          expect(step.level).toBe('B');
          expect(step.requiresAction?.id).toBe(step.id);
          expect(step.requiresAction?.detects.length).toBeGreaterThan(0);
          expect(step.softSkipLabel).toBeTruthy();
        }
      }
    }
  });

  it('omits groups chapter when groupLessons is off', () => {
    const without = getTourChapters('teacher', { groupLessonsEnabled: false }).map((c) => c.id);
    const withGroups = getTourChapters('teacher', { groupLessonsEnabled: true }).map((c) => c.id);
    expect(without).not.toContain('tea-ch-groups');
    expect(withGroups).toContain('tea-ch-groups');
  });

  it('getTourQuestSteps flattens chapter steps', () => {
    const chapters = getTourChapters('teacher');
    const flat = getTourQuestSteps('teacher');
    expect(flat.length).toBe(chapters.reduce((n, c) => n + c.steps.length, 0));
    expect(flat.length).toBeGreaterThanOrEqual(2);
  });
});
