'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyStateCard, UserAvatar } from '../../../components/ui';
import { ProfileViewShell } from '../../../components/profile/ProfileViewShell';
import { buildStudentLessonList } from '../../../lib/student-lessons';
import { filterLessonsForStudent } from '../../../lib/student-live-stats';
import { useAchievementStats } from '../../../hooks/use-achievement-stats';
import { useStudentLiveStats } from '../../../hooks/use-student-live-stats';
import { useLessonsStore } from '../../../stores/lessons-store';
import { isAdminOrSuper, isTeacherAdminOrSuper } from '../../../lib/roles';
import { USER_ACCOUNT_STATUS, USER_ROLE } from '@pkg/types';
import type { MockStudent } from '../../../lib/user-models';
import { useActiveUser } from '../../../lib/active-user';
import { useOptionalAuth } from '../../../lib/auth-context';
import {
  canManageBackendStudent,
  resolveStudentProfile,
} from '../../../lib/student-profile';
import { useStudentsStore } from '../../../stores/students-store';
import { useLessonPartyOptions } from '../../../hooks/use-lesson-party-options';
import { useSchoolGroupLessons } from '../../../hooks/use-school-group-lessons';
import { useStudentLessonBalance } from '../../../hooks/use-student-lesson-balance';
import { getLessonBackendId } from '../../../features/lesson-modal/scheduledLessonsBackendAdapter';
import {
  buildStudentHeroAction,
  formatContactMetaLine,
} from '../../../lib/profile-hero-highlights';
import { splitStudentBillingTracks } from '../../../lib/billing/student-billing-tracks';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import styles from './page.module.scss';
import { StudentPageSkeleton } from './StudentPageSkeleton';
import { createLazyPanel } from '../../../lib/client/lazy-panel';
import { TabPanelLoading } from './TabPanelLoading';
import { useStudentProfileSave } from './useStudentProfileSave';
import { useStudentHeroData } from './useStudentHeroData';

const StudentProfileTab = createLazyPanel(
  () => import('./StudentProfileTab').then((module) => module.StudentProfileTab),
  () => <TabPanelLoading variant="form" rows={6} />,
);
const StudentStatisticsTab = createLazyPanel(
  () => import('./StudentStatisticsTab').then((module) => module.StudentStatisticsTab),
  () => <TabPanelLoading variant="chart" />,
);
const StudentLessonsTab = createLazyPanel(
  () => import('./StudentLessonsTab').then((module) => module.StudentLessonsTab),
  () => <TabPanelLoading variant="list" rows={5} />,
);
const StudentBillingTab = createLazyPanel(
  () => import('./StudentBillingTab').then((module) => module.StudentBillingTab),
  () => <TabPanelLoading variant="billing" />,
);
const StudentAchievementsTab = createLazyPanel(
  () => import('./StudentAchievementsTab').then((module) => module.StudentAchievementsTab),
  () => <TabPanelLoading variant="grid" />,
);
const StudentPracticeTab = createLazyPanel(
  () => import('./StudentPracticeTab').then((module) => module.StudentPracticeTab),
  () => <TabPanelLoading variant="list" rows={5} />,
);

const EMPTY_STUDENT: MockStudent = {
  id: 0,
  userId: 0,
  fullName: '',
  proficiencyLevelId: 1,
  email: '',
  phone: '',
  timezoneId: 1,
  statusId: USER_ACCOUNT_STATUS.active.id,
  scheduleType: true,
  teacherId: 0,
  teacherName: '',
  wordsLearned: 0,
  lessonsCompleted: 0,
  streakDays: 0,
};

export default function StudentDetailsPage() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const params = useParams<{ studentId: string }>();
  const studentId = params?.studentId ?? '';
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const { teacherOptions, nameByNumericId } = useLessonPartyOptions();
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const backendRow = list.data?.find((row) => row.id === studentId);
  const resolved = useMemo(
    () => resolveStudentProfile(studentId, list.data ?? undefined),
    [studentId, list.data],
  );

  const [tab, setTab] = useState<
    'profile' | 'statistics' | 'lessons' | 'billing' | 'achievements' | 'practice'
  >('profile');
  const [visitedTabs, setVisitedTabs] = useState(() => new Set<string>(['profile']));
  const [studentForm, setStudentForm] = useState<MockStudent>(EMPTY_STUDENT);
  const [teacherBackendId, setTeacherBackendId] = useState<string | null>(null);
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const studentBackendId = resolved?.backendId;
  const { enabled: groupLessonsEnabled } = useSchoolGroupLessons();
  const { balance: lessonBalance } = useStudentLessonBalance(
    groupLessonsEnabled && isTeacherAdminOrSuper(activeUser.role) ? studentBackendId : null,
  );
  const { studentLessons: liveStudentLessons } = useStudentLiveStats(studentBackendId);
  const { stats: liveProfileStats, loading: achievementsLoading } = useAchievementStats({
    studentId: studentBackendId ?? undefined,
    enabled: Boolean(studentBackendId),
  });

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!resolved?.profile) return;
    setStudentForm(resolved.profile);
    setTeacherBackendId(resolved.teacherBackendId);
  }, [resolved?.profile]);

  useEffect(() => {
    if (!backendRow?.displayColor) return;
    setStudentForm((prev) => ({ ...prev, color: backendRow.displayColor! }));
  }, [backendRow?.displayColor, studentId]);

  useEffect(() => {
    setNativeLanguageId(backendRow?.nativeLanguageId ?? '');
  }, [backendRow?.nativeLanguageId]);

  const lessons = useMemo(() => {
    if (!studentBackendId) return [];
    const rows =
      liveStudentLessons.length > 0
        ? liveStudentLessons
        : filterLessonsForStudent(backendLessons.data, studentBackendId);
    return buildStudentLessonList(rows, nameByNumericId);
  }, [backendLessons.data, liveStudentLessons, nameByNumericId, studentBackendId]);

  const lessonFormat = studentForm.lessonFormat ?? backendRow?.lessonFormat ?? 'mixed';
  const billingTracks = useMemo(() => {
    if (!lessonBalance || !groupLessonsEnabled) return null;
    return splitStudentBillingTracks(lessonBalance, lessonFormat);
  }, [groupLessonsEnabled, lessonBalance, lessonFormat]);

  const { heroStats, profileBadges, studentAchievements, recentUnlockedAchievements } =
    useStudentHeroData({
      liveProfileStats,
      achievementsLoading,
      billingTracks,
      groupLessonsEnabled,
      activeUserRole: activeUser.role,
      studentForm,
      lessonFormat,
      t,
    });

  const { savedProfile, saveError, onSave } = useStudentProfileSave({
    studentForm,
    setStudentForm,
    resolvedBackendId: resolved?.backendId,
    resolvedTeacherBackendId: resolved?.teacherBackendId,
    teacherBackendId,
    nativeLanguageId,
    backendRow: backendRow ?? null,
    activeUserRole: activeUser.role,
    teacherOptions,
  });

  const heroAction = useMemo(
    () =>
      buildStudentHeroAction(
        lessons,
        (lesson) => `/lessons/${getLessonBackendId(lesson)}`,
        undefined,
        t,
        locale,
      ),
    [lessons, locale, t],
  );

  const heroMetaExtra = useMemo(
    () => formatContactMetaLine(studentForm.email, studentForm.timezoneId),
    [studentForm.email, studentForm.timezoneId],
  );

  const hasStudentInCache = Boolean(list.data?.some((row) => row.id === studentId));
  const loading = list.status === 'loading' && !hasStudentInCache;
  if (loading && !resolved) {
    return <StudentPageSkeleton />;
  }

  if (!resolved) {
    return (
      <EmptyStateCard
        title={t('students.detail.notFoundTitle')}
        description={t('students.detail.notFoundDesc')}
      />
    );
  }

  const canManage = canManageBackendStudent(
    activeUser.role,
    auth.user,
    backendRow ?? null,
    resolved.profile,
  );

  if (!canManage) {
    return (
      <EmptyStateCard
        title={t('students.detail.noPermissionTitle')}
        description={t('students.detail.noPermissionDesc')}
      />
    );
  }

  const avatarUrl = resolved.avatarUrl;

  return (
    <ProfileViewShell
      keepMountedTabs={false}
      tabsAriaLabel={t('students.detail.tabsAria')}
      back={
        <Link href="/students" className={styles.backLink} aria-label={t('students.detail.backAria')}>
          <ArrowLeft size={18} aria-hidden />
        </Link>
      }
      title={t('students.detail.title')}
      subtitle={t('students.detail.subtitle')}
      avatar={
        <UserAvatar
          size="xl"
          src={avatarUrl}
          name={studentForm.fullName}
          email={studentForm.email}
        />
      }
      name={studentForm.fullName}
      meta={t('students.card.teacher', { name: studentForm.teacherName })}
      metaExtra={heroMetaExtra}
      badges={profileBadges}
      heroAction={heroAction}
      stats={heroStats}
      heroActions={
        studentBackendId && isTeacherAdminOrSuper(activeUser.role) ? (
          <Link
            href={`/chat?peer=${encodeURIComponent(studentBackendId)}`}
            className={styles.heroChatBtn}
            data-tour-anchor="student-hero-chat"
            aria-label={t('students.detail.openChatAria', { name: studentForm.fullName })}
            title={t('students.detail.openChatTitle')}
          >
            <MessageCircle size={20} aria-hidden />
          </Link>
        ) : null
      }
      achievements={recentUnlockedAchievements}
      tab={tab}
      onTabChange={(next) => {
        setTab(next);
        setVisitedTabs((prev) => {
          const copy = new Set(prev);
          copy.add(next);
          return copy;
        });
      }}
      tabs={[
        {
          value: 'profile',
          label: t('profile.tab.profile'),
          panel: (
            <StudentProfileTab
              student={studentForm}
              onChange={setStudentForm}
              canEdit={canManage}
              viewerRole={activeUser.role}
              teacherBackendId={teacherBackendId}
              teacherOptions={teacherOptions.map((row) => ({
                id: row.backendId,
                displayName: row.fullName,
              }))}
              onTeacherBackendIdChange={setTeacherBackendId}
              showNativeLanguage={Boolean(resolved.backendId)}
              nativeLanguageId={nativeLanguageId}
              onNativeLanguageIdChange={setNativeLanguageId}
              saved={savedProfile}
              saveError={saveError}
              onSave={onSave}
            />
          ),
        },
        {
          value: 'statistics',
          label: t('profile.tab.statistics'),
          panel: studentBackendId && (tab === 'statistics' || visitedTabs.has('statistics')) ? (
            <StudentStatisticsTab studentId={studentBackendId} />
          ) : studentBackendId ? null : (
            <EmptyStateCard
              title={t('students.detail.unavailable.title', { feature: t('profile.tab.statistics') })}
              description={t('students.detail.unavailable.linkBackend')}
            />
          ),
        },
        {
          value: 'lessons',
          label: t('students.detail.tab.lessons'),
          panel: tab === 'lessons' || visitedTabs.has('lessons') ? (
            <StudentLessonsTab lessons={lessons} groupLessonsEnabled={groupLessonsEnabled} />
          ) : null,
        },
        {
          value: 'billing',
          label: t('students.detail.tab.billing'),
          dataAttrs: { 'data-tour-anchor': 'student-billing-tab' },
          panel: studentBackendId && (tab === 'billing' || visitedTabs.has('billing')) ? (
            <StudentBillingTab
              studentBackendId={studentBackendId}
              canAdjust={isAdminOrSuper(activeUser.role)}
              isAdmin={isAdminOrSuper(activeUser.role)}
              hideStudentPricing={activeUser.role === USER_ROLE.teacher.id}
            />
          ) : studentBackendId ? null : (
            <EmptyStateCard
              title={t('students.detail.unavailable.title', { feature: t('students.detail.tab.billing') })}
              description={t('students.detail.unavailable.linkBackend')}
            />
          ),
        },
        {
          value: 'achievements',
          label: t('profile.tab.achievements'),
          panel: tab === 'achievements' || visitedTabs.has('achievements') ? (
            <StudentAchievementsTab achievements={studentAchievements} />
          ) : null,
        },
        {
          value: 'practice',
          label: t('students.detail.tab.practice'),
          dataAttrs: { 'data-tour-anchor': 'student-practice-tab' },
          panel: resolved.backendId && (tab === 'practice' || visitedTabs.has('practice')) ? (
            <StudentPracticeTab studentId={resolved.backendId} />
          ) : resolved.backendId ? null : (
            <EmptyStateCard
              title={t('students.detail.unavailable.title', { feature: t('students.detail.tab.practice') })}
              description={t('students.detail.unavailable.linkBackend')}
            />
          ),
        },
      ]}
    />
  );
}
