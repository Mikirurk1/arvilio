import {
  DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS,
  type PaymentConfigDto,
  type PaymentSettingsDto,
  type ScheduledLessonDto,
} from '@pkg/types';
import type { StatisticsDashboardViewModel } from './map-statistics-dashboard';
import { getStudentsNavLabel } from './nav/students-nav-label';
import type { TranslateFn } from './cms/nav-i18n';

export type GroupLessonsUiSurfaces = {
  studentsNavLabel: string;
  studentsPageTitle: string;
  studentsPageViewSwitcher: boolean;
  studentsGroupsPanel: boolean;
  lessonModalKindToggle: boolean;
  lessonModalFetchGroups: boolean;
  studentProfileLessonFormatField: boolean;
  studentProfileFormatBadge: boolean;
  studentBillingSplitTracks: boolean;
  studentLessonsKindFilter: boolean;
  studentLessonsKindBadge: boolean;
  calendarGroupLessonLabel: boolean;
  statisticsGroupKpis: boolean;
  paymentsGroupBillingControls: boolean;
};

export function resolveGroupLessonsUiSurfaces(enabled: boolean): GroupLessonsUiSurfaces {
  return {
    studentsNavLabel: getStudentsNavLabel(enabled),
    studentsPageTitle: enabled ? 'Students & Groups' : 'Students',
    studentsPageViewSwitcher: enabled,
    studentsGroupsPanel: enabled,
    lessonModalKindToggle: enabled,
    lessonModalFetchGroups: enabled,
    studentProfileLessonFormatField: enabled,
    studentProfileFormatBadge: enabled,
    studentBillingSplitTracks: enabled,
    studentLessonsKindFilter: enabled,
    studentLessonsKindBadge: enabled,
    calendarGroupLessonLabel: enabled,
    statisticsGroupKpis: enabled,
    paymentsGroupBillingControls: enabled,
  };
}

export function syncGroupLessonsEnabled(
  draft: PaymentSettingsDto,
  enabled: boolean,
): PaymentSettingsDto {
  return {
    ...draft,
    config: {
      ...draft.config,
      groupLessons: {
        ...(draft.config.groupLessons ?? DEFAULT_SCHOOL_GROUP_LESSONS_SETTINGS),
        enabled,
      },
    },
  };
}

export function resolveStudentsPageView(
  groupLessonsEnabled: boolean,
  urlView: string | null | undefined,
): 'students' | 'groups' {
  return groupLessonsEnabled && urlView === 'groups' ? 'groups' : 'students';
}

export function resolveStudentsPageSubtitle(
  groupLessonsEnabled: boolean,
  isTeacher: boolean,
  t?: TranslateFn,
): string {
  const key = isTeacher
    ? 'students.subtitleTeacher'
    : groupLessonsEnabled
      ? 'students.subtitleAdminGroups'
      : 'students.subtitleAdmin';
  if (t) return t(key);
  if (isTeacher) return 'Only students assigned to you';
  return groupLessonsEnabled
    ? 'Manage students and learning groups for your school'
    : 'All students and their assigned teachers';
}

export function shouldFetchStudentGroups(groupLessonsEnabled: boolean, isStudentRole: boolean): boolean {
  return groupLessonsEnabled && !isStudentRole;
}

export function shouldShowLessonModalGroupPicker(
  groupLessonsEnabled: boolean,
  lessonKind: string | null | undefined,
): boolean {
  return groupLessonsEnabled && lessonKind === 'group';
}

export function shouldFetchStudentBalanceForBillingTracks(
  groupLessonsEnabled: boolean,
  hasStudentId: boolean,
): boolean {
  return groupLessonsEnabled && hasStudentId;
}

export function shouldShowStudentLessonFormatField(
  groupLessonsEnabled: boolean,
  isStudentViewer: boolean,
): boolean {
  return groupLessonsEnabled && !isStudentViewer;
}

export function shouldShowStudentProfileFormatBadge(groupLessonsEnabled: boolean): boolean {
  return groupLessonsEnabled;
}

export function resolveCalendarLessonTypeLabel(
  groupLessonsEnabled: boolean,
  lesson: Pick<ScheduledLessonDto, 'kind' | 'studentName'>,
  groupLabel: string,
): string {
  if (groupLessonsEnabled && lesson.kind === 'group') return groupLabel;
  return lesson.studentName;
}

export type LessonKindFilter = 'all' | 'individual' | 'group';

export function filterStudentLessonsByKind(
  lessons: ScheduledLessonDto[],
  groupLessonsEnabled: boolean,
  kindFilter: LessonKindFilter,
): ScheduledLessonDto[] {
  if (!groupLessonsEnabled || kindFilter === 'all') return lessons;
  return lessons.filter((lesson) => lesson.kind === kindFilter);
}

export function stripGroupContentFromStatisticsView(
  view: StatisticsDashboardViewModel,
  groupLessonsEnabled: boolean,
): StatisticsDashboardViewModel {
  if (groupLessonsEnabled) return view;
  const hideGroup = (id: string) => id.startsWith('group-');
  return {
    ...view,
    kpis: view.kpis.filter((kpi) => !hideGroup(kpi.id)),
    kpisByCategory: view.kpisByCategory
      .map((group) => ({
        ...group,
        items: group.items.filter((kpi) => !hideGroup(kpi.id)),
      }))
      .filter((group) => group.items.length > 0),
    roster: view.roster?.map((row) => ({ ...row, lessonTypeLabel: undefined })),
  };
}

export function isGroupLessonsFeatureEnabled(config: Pick<PaymentConfigDto, 'groupLessons'>): boolean {
  return config.groupLessons?.enabled === true;
}
