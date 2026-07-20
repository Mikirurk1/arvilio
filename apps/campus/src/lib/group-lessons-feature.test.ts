import type { PaymentSettingsDto, ScheduledLessonDto } from '@pkg/types';
import {
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  GROUP_LESSONS_FEATURE_DISABLED_MESSAGE,
  isGroupLessonsEnabled,
} from '@pkg/types';
import type { StatisticsDashboardViewModel } from './map-statistics-dashboard';
import {
  filterStudentLessonsByKind,
  resolveCalendarLessonTypeLabel,
  resolveGroupLessonsUiSurfaces,
  resolveStudentsPageSubtitle,
  resolveStudentsPageView,
  shouldFetchStudentBalanceForBillingTracks,
  shouldFetchStudentGroups,
  shouldShowLessonModalGroupPicker,
  shouldShowStudentLessonFormatField,
  shouldShowStudentProfileFormatBadge,
  stripGroupContentFromStatisticsView,
  syncGroupLessonsEnabled,
} from './group-lessons-feature';

const basePaymentSettings = (): PaymentSettingsDto =>
  ({
    enabledMethods: [],
    config: {
      defaultPricePerLessonMinor: 0,
      defaultCurrency: 'UAH',
      allowedCurrencies: ['UAH'],
      minPackageLessons: 1,
      packages: [],
      manualInvoiceMethods: [],
      groupLessons: { ...DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS, enabled: false },
    },
    methods: [],
    secretStatuses: {},
  }) as PaymentSettingsDto;

const lesson = (overrides: Partial<ScheduledLessonDto>): ScheduledLessonDto =>
  ({
    id: 'l1',
    title: 'Lesson',
    date: '2026-06-01',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    timezone: 'UTC',
    teacherId: 't1',
    teacherName: 'Teacher',
    studentId: 's1',
    studentName: 'Student One',
    status: 'planned',
    kind: 'individual',
    ...overrides,
  }) as ScheduledLessonDto;

const statsView = (): StatisticsDashboardViewModel =>
  ({
    layout: 'staff',
    title: 'Stats',
    rangeLabel: 'Week',
    kpis: [
      { id: 'lessons-completed', category: 'lessons', label: 'Lessons', value: '1', trend: 'flat' },
      { id: 'group-lessons-completed', category: 'lessons', label: 'Group lessons', value: '2', trend: 'flat' },
    ],
    kpisByCategory: [
      {
        category: 'lessons',
        categoryLabel: 'Lessons',
        items: [
          { id: 'lessons-completed', category: 'lessons', label: 'Lessons', value: '1', trend: 'flat' },
          { id: 'group-roster', category: 'lessons', label: 'Group roster', value: '3', trend: 'flat' },
        ],
      },
    ],
    lessonsTrend: [],
    vocabularyTrend: [],
    lessonStatusBreakdown: [],
    vocabStatusBreakdown: [],
    practiceTrend: [],
    dailyGoalsTrend: [],
    dailyGoalsSummary: null,
    staffOverview: undefined,
    schoolOverview: undefined,
    roster: [{ id: 's1', displayName: 'Student', lessonTypeLabel: 'Group only' }],
    isStudentLayout: false,
  }) as StatisticsDashboardViewModel;

describe('group-lessons-feature', () => {
  it('isGroupLessonsEnabled only treats explicit true as enabled', () => {
    expect(isGroupLessonsEnabled({})).toBe(false);
    expect(
      isGroupLessonsEnabled({
        groupLessons: { ...DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS, enabled: true },
      }),
    ).toBe(true);
    expect(GROUP_LESSONS_FEATURE_DISABLED_MESSAGE).toMatch(/not enabled for this school/i);
  });

  describe('resolveGroupLessonsUiSurfaces', () => {
    it('hides all group-specific UI when disabled', () => {
      const surfaces = resolveGroupLessonsUiSurfaces(false);
      expect(surfaces.studentsNavLabel).toBe('Students');
      expect(surfaces.studentsPageTitle).toBe('Students');
      expect(surfaces.studentsPageViewSwitcher).toBe(false);
      expect(surfaces.studentsGroupsPanel).toBe(false);
      expect(surfaces.lessonModalKindToggle).toBe(false);
      expect(surfaces.lessonModalFetchGroups).toBe(false);
      expect(surfaces.studentProfileLessonFormatField).toBe(false);
      expect(surfaces.studentProfileFormatBadge).toBe(false);
      expect(surfaces.studentBillingSplitTracks).toBe(false);
      expect(surfaces.studentLessonsKindFilter).toBe(false);
      expect(surfaces.studentLessonsKindBadge).toBe(false);
      expect(surfaces.calendarGroupLessonLabel).toBe(false);
      expect(surfaces.statisticsGroupKpis).toBe(false);
      expect(surfaces.paymentsGroupBillingControls).toBe(false);
    });

    it('shows all group-specific UI when enabled', () => {
      const surfaces = resolveGroupLessonsUiSurfaces(true);
      expect(surfaces.studentsNavLabel).toBe('Students & Groups');
      expect(surfaces.studentsPageTitle).toBe('Students & Groups');
      expect(surfaces.studentsPageViewSwitcher).toBe(true);
      expect(surfaces.studentsGroupsPanel).toBe(true);
      expect(surfaces.lessonModalKindToggle).toBe(true);
      expect(surfaces.lessonModalFetchGroups).toBe(true);
      expect(surfaces.studentProfileLessonFormatField).toBe(true);
      expect(surfaces.studentProfileFormatBadge).toBe(true);
      expect(surfaces.studentBillingSplitTracks).toBe(true);
      expect(surfaces.studentLessonsKindFilter).toBe(true);
      expect(surfaces.studentLessonsKindBadge).toBe(true);
      expect(surfaces.calendarGroupLessonLabel).toBe(true);
      expect(surfaces.statisticsGroupKpis).toBe(true);
      expect(surfaces.paymentsGroupBillingControls).toBe(true);
    });
  });

  it('syncGroupLessonsEnabled toggles config.groupLessons.enabled', () => {
    const draft = basePaymentSettings();
    expect(syncGroupLessonsEnabled(draft, true).config.groupLessons?.enabled).toBe(true);
    expect(syncGroupLessonsEnabled(syncGroupLessonsEnabled(draft, true), false).config.groupLessons?.enabled).toBe(false);
  });

  it('resolveStudentsPageView ignores groups URL when feature is off', () => {
    expect(resolveStudentsPageView(false, 'groups')).toBe('students');
    expect(resolveStudentsPageView(true, 'groups')).toBe('groups');
    expect(resolveStudentsPageView(true, null)).toBe('students');
  });

  it('resolveStudentsPageSubtitle switches copy for admins when groups are enabled', () => {
    expect(resolveStudentsPageSubtitle(false, false)).toMatch(/All students/);
    expect(resolveStudentsPageSubtitle(true, false)).toMatch(/learning groups/);
    expect(resolveStudentsPageSubtitle(true, true)).toBe('Only students assigned to you');
  });

  it('gates lesson modal and profile group fields', () => {
    expect(shouldFetchStudentGroups(false, false)).toBe(false);
    expect(shouldFetchStudentGroups(true, true)).toBe(false);
    expect(shouldFetchStudentGroups(true, false)).toBe(true);
    expect(shouldShowLessonModalGroupPicker(false, 'group')).toBe(false);
    expect(shouldShowLessonModalGroupPicker(true, 'individual')).toBe(false);
    expect(shouldShowLessonModalGroupPicker(true, 'group')).toBe(true);
    expect(shouldShowStudentLessonFormatField(false, false)).toBe(false);
    expect(shouldShowStudentLessonFormatField(true, true)).toBe(false);
    expect(shouldShowStudentLessonFormatField(true, false)).toBe(true);
    expect(shouldShowStudentProfileFormatBadge(false)).toBe(false);
    expect(shouldShowStudentProfileFormatBadge(true)).toBe(true);
    expect(shouldFetchStudentBalanceForBillingTracks(false, true)).toBe(false);
    expect(shouldFetchStudentBalanceForBillingTracks(true, false)).toBe(false);
    expect(shouldFetchStudentBalanceForBillingTracks(true, true)).toBe(true);
  });

  it('filterStudentLessonsByKind only filters when feature is on', () => {
    const lessons = [
      lesson({ id: 'a', kind: 'individual' }),
      lesson({ id: 'b', kind: 'group' }),
    ];
    expect(filterStudentLessonsByKind(lessons, false, 'group')).toHaveLength(2);
    expect(filterStudentLessonsByKind(lessons, true, 'group')).toEqual([lessons[1]]);
  });

  it('resolveCalendarLessonTypeLabel shows group suffix only when enabled', () => {
    const row = lesson({ kind: 'group', studentName: 'Alice' });
    expect(resolveCalendarLessonTypeLabel(false, row, 'Alice · Group')).toBe('Alice');
    expect(resolveCalendarLessonTypeLabel(true, row, 'Alice · Group')).toBe('Alice · Group');
  });

  it('stripGroupContentFromStatisticsView removes group KPIs and roster labels when disabled', () => {
    const view = statsView();
    const stripped = stripGroupContentFromStatisticsView(view, false);
    expect(stripped.kpis.map((kpi) => kpi.id)).toEqual(['lessons-completed']);
    expect(stripped.kpisByCategory[0]?.items.map((kpi) => kpi.id)).toEqual(['lessons-completed']);
    expect(stripped.roster?.[0]?.lessonTypeLabel).toBeUndefined();
    expect(stripGroupContentFromStatisticsView(view, true)).toEqual(view);
  });
});
