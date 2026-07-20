import { getHelpSteps, resolveHelpTrack, resolveHelpCmsTrackId, FIRST_WORDS_CMS_TRACK_ID } from './index';
import { filterHelpStepsForPage } from '../tour-context';

describe('getHelpSteps', () => {
  it('maps super_admin Help to admin catalog', () => {
    expect(resolveHelpTrack('super_admin')).toBe('admin');
    expect(resolveHelpCmsTrackId('super_admin')).toBe('helpAdmin');
    expect(resolveHelpCmsTrackId('student')).toBe('helpStudent');
    expect(resolveHelpCmsTrackId('teacher')).toBe('helpTeacher');
    expect(FIRST_WORDS_CMS_TRACK_ID).toBe('firstWords');
    expect(getHelpSteps('super_admin').some((s) => s.id.startsWith('help-adm-'))).toBe(true);
  });

  it('filters admin dashboard Help to page tips (not full Level A)', () => {
    const help = getHelpSteps('admin');
    const onDash = filterHelpStepsForPage({
      steps: help,
      pathname: '/uk/dashboard',
    });
    expect(onDash.length).toBeGreaterThanOrEqual(9);
    expect(onDash.every((s) => s.navHref === '/dashboard')).toBe(true);
    expect(onDash.map((s) => s.id)).toContain('help-adm-dash-entitlements');
    expect(onDash.map((s) => s.id)).not.toContain('help-adm-cal-create');
  });

  it('does not pull calendar create tip onto dashboard via header chrome', () => {
    const onDash = filterHelpStepsForPage({
      steps: getHelpSteps('admin'),
      pathname: '/dashboard',
      pageAnchorIds: ['header-create-lesson', 'dash-hero'],
    });
    expect(onDash.every((s) => s.navHref === '/dashboard')).toBe(true);
    expect(onDash.map((s) => s.id)).not.toContain('help-adm-cal-create');
  });

  it('filters student practice Help by pathname', () => {
    const onPractice = filterHelpStepsForPage({
      steps: getHelpSteps('student'),
      pathname: '/practice',
    });
    expect(onPractice.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        'help-stu-practice-hub',
        'help-stu-practice-vocab',
        'help-stu-practice-quiz',
      ]),
    );
    expect(onPractice.some((s) => s.navHref === '/payment')).toBe(false);
  });

  it('expands admin/super_admin Practice Help beyond a single hub tip', () => {
    const onPractice = filterHelpStepsForPage({
      steps: getHelpSteps('super_admin'),
      pathname: '/uk/practice',
    });
    expect(onPractice.length).toBeGreaterThanOrEqual(6);
    expect(onPractice.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        'help-adm-practice-hub',
        'help-adm-practice-stats',
        'help-adm-practice-vocab',
        'help-adm-practice-quiz',
        'help-adm-practice-speaking',
        'help-adm-practice-irregular',
      ]),
    );
    expect(onPractice.every((s) => s.navHref === '/practice')).toBe(true);
  });

  it('expands teacher Practice Help to full hub cards', () => {
    const onPractice = filterHelpStepsForPage({
      steps: getHelpSteps('teacher'),
      pathname: '/practice',
    });
    expect(onPractice.length).toBeGreaterThanOrEqual(6);
    expect(onPractice.map((s) => s.id)).toContain('help-tea-practice-vocab');
  });

  it('prefers nested speaking Help over practice hub tips', () => {
    const onSpeaking = filterHelpStepsForPage({
      steps: getHelpSteps('admin'),
      pathname: '/practice/speaking',
    });
    expect(onSpeaking.map((s) => s.id)).toEqual(['help-adm-speaking-record']);
  });

  it('filters student vocabulary Help to /vocabulary', () => {
    const onVocab = filterHelpStepsForPage({
      steps: getHelpSteps('student'),
      pathname: '/uk/vocabulary',
    });
    expect(onVocab.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        'help-stu-vocab-modes',
        'help-stu-vocab-stats',
        'help-stu-vocab-add',
      ]),
    );
    expect(onVocab.every((s) => s.navHref === '/vocabulary')).toBe(true);
  });

  it('aliases /practice/vocabulary to vocab Help not practice hub', () => {
    const onVocab = filterHelpStepsForPage({
      steps: getHelpSteps('student'),
      pathname: '/uk/practice/vocabulary',
    });
    expect(onVocab.every((s) => s.navHref === '/vocabulary')).toBe(true);
    expect(onVocab.map((s) => s.id)).toEqual(
      expect.arrayContaining(['help-stu-vocab-modes', 'help-stu-vocab-add']),
    );
    expect(onVocab.some((s) => s.id.startsWith('help-stu-practice-'))).toBe(false);
  });

  it('aliases /practice/quiz to quiz Help not practice hub', () => {
    const onQuiz = filterHelpStepsForPage({
      steps: getHelpSteps('student'),
      pathname: '/practice/quiz',
    });
    expect(onQuiz.every((s) => s.navHref === '/quiz')).toBe(true);
    expect(onQuiz.map((s) => s.id)).toContain('help-stu-quiz-hero');
    expect(onQuiz.some((s) => s.id === 'help-stu-practice-hub')).toBe(false);
  });

  it('filters speaking Help to nested practice path', () => {
    const onSpeaking = filterHelpStepsForPage({
      steps: getHelpSteps('student'),
      pathname: '/practice/speaking',
    });
    expect(onSpeaking.map((s) => s.id)).toContain('help-stu-speaking-record');
  });

  it('gates teacher groups Help on groupLessons', () => {
    const off = getHelpSteps('teacher', { groupLessonsEnabled: false });
    const on = getHelpSteps('teacher', { groupLessonsEnabled: true });
    expect(off.some((s) => s.id === 'help-tea-students-groups')).toBe(false);
    expect(on.some((s) => s.id === 'help-tea-students-groups')).toBe(true);
  });
});
