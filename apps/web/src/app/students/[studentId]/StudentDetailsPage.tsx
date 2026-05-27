'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyStateCard } from '../../../components/ui';
import { ProfileViewShell } from '../../../components/profile/ProfileViewShell';
import { buildStudentLessonList } from '../../../lib/student-lessons';
import { filterLessonsForStudent } from '../../../lib/student-live-stats';
import { useAchievementStats } from '../../../hooks/use-achievement-stats';
import { useStudentLiveStats } from '../../../hooks/use-student-live-stats';
import { useLessonsStore } from '../../../stores/lessons-store';
import {
  buildProfileAchievements,
  getProficiencyLevelById,
  getUserAccountStatusById,
  isAdminOrSuper,
  isTeacherAdminOrSuper,
  mockUsers,
  USER_ACCOUNT_STATUS,
  USER_ROLE,
  type MockStudent,
} from '../../../mocks';
import { useActiveUser } from '../../../lib/active-user';
import { useOptionalAuth } from '../../../lib/auth-context';
import { getAvatarFallbackInitials } from '../../../lib/avatar';
import {
  canManageBackendStudent,
  resolveStudentProfile,
} from '../../../lib/student-profile';
import { useStudentsStore } from '../../../stores/students-store';
import { useLessonPartyOptions } from '../../../hooks/use-lesson-party-options';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  Gem,
  GraduationCap,
  MessageCircle,
  Mic,
  Mountain,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';
import styles from './page.module.scss';
import { StudentPageSkeleton } from './StudentPageSkeleton';
import { createLazyPanel } from '../../../lib/client/lazy-panel';
import { TabPanelLoading } from './TabPanelLoading';

const StudentProfileTab = createLazyPanel(
  () => import('./StudentProfileTab').then((module) => module.StudentProfileTab),
  () => <TabPanelLoading variant="form" rows={6} />,
);
const StudentStatisticsTab = createLazyPanel(
  () => import('./sections').then((module) => module.StudentStatisticsTab),
  () => <TabPanelLoading variant="chart" />,
);
const StudentLessonsTab = createLazyPanel(
  () => import('./sections').then((module) => module.StudentLessonsTab),
  () => <TabPanelLoading variant="list" rows={5} />,
);
const StudentBillingTab = createLazyPanel(
  () => import('./sections').then((module) => module.StudentBillingTab),
  () => <TabPanelLoading variant="billing" />,
);
const StudentAchievementsTab = createLazyPanel(
  () => import('./sections').then((module) => module.StudentAchievementsTab),
  () => <TabPanelLoading variant="grid" />,
);
const StudentVocabularyTab = createLazyPanel(
  () => import('./StudentVocabularyTab').then((module) => module.StudentVocabularyTab),
  () => <TabPanelLoading variant="list" rows={4} />,
);
const StudentQuizTab = createLazyPanel(
  () => import('./StudentQuizTab').then((module) => module.StudentQuizTab),
  () => <TabPanelLoading variant="default" rows={5} />,
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
  const params = useParams<{ studentId: string }>();
  const studentId = params?.studentId ?? '';
  const activeUser = useActiveUser();
  const auth = useOptionalAuth();
  const list = useStudentsStore((s) => s.list);
  const fetchStudents = useStudentsStore((s) => s.fetchStudents);
  const updateStudentAdmin = useStudentsStore((s) => s.updateStudentAdmin);
  const { teacherOptions, nameByNumericId } = useLessonPartyOptions();
  const backendLessons = useLessonsStore((s) => s.backendLessons);
  const backendRow = list.data?.find((row) => row.id === studentId);
  const resolved = useMemo(
    () => resolveStudentProfile(studentId, list.data ?? undefined),
    [studentId, list.data],
  );

  const [tab, setTab] = useState<
    'profile' | 'statistics' | 'lessons' | 'billing' | 'achievements' | 'vocabulary' | 'quiz'
  >('profile');
  const [visitedTabs, setVisitedTabs] = useState(() => new Set<string>(['profile']));
  const [studentForm, setStudentForm] = useState<MockStudent>(EMPTY_STUDENT);
  const [teacherBackendId, setTeacherBackendId] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const studentBackendId = resolved?.backendId;
  const { studentLessons: liveStudentLessons } = useStudentLiveStats(studentBackendId);
  const {
    stats: liveProfileStats,
    loading: achievementsLoading,
  } = useAchievementStats({
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

  const pageSubtitle = useMemo(() => 'Manage student profile, lessons and scheduling', []);
  const achievementIconMap = {
    sparkles: <Sparkles size={20} />,
    'graduation-cap': <GraduationCap size={20} />,
    'calendar-check': <CalendarCheck size={20} />,
    flame: <Flame size={20} />,
    'book-open': <BookOpen size={20} />,
    brain: <Brain size={20} />,
    'messages-square': <MessageCircle size={20} />,
    mic: <Mic size={20} />,
    target: <Target size={20} />,
    'badge-check': <BadgeCheck size={20} />,
    star: <Star size={20} />,
    rocket: <Rocket size={20} />,
    trophy: <Trophy size={20} />,
    crown: <Crown size={20} />,
    mountain: <Mountain size={20} />,
    gem: <Gem size={20} />,
  } as const;

  const studentAchievements = buildProfileAchievements(liveProfileStats).map((achievement) => ({
    icon: achievementIconMap[achievement.icon],
    label: achievement.label,
    description: achievement.description,
    unlocked: achievement.unlocked,
  }));
  const recentUnlockedAchievements = studentAchievements
    .filter((achievement) => achievement.unlocked)
    .slice(-10);

  const hasStudentInCache = Boolean(list.data?.some((row) => row.id === studentId));
  const loading = list.status === 'loading' && !hasStudentInCache;
  if (loading && !resolved) {
    return <StudentPageSkeleton />;
  }

  if (!resolved) {
    return (
      <EmptyStateCard
        title="Student not found"
        description="Check the student link and try again."
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
      <EmptyStateCard title="No permission" description="You cannot manage this student." />
    );
  }

  const avatarUrl = resolved.avatarUrl;
  const mockAvatar = mockUsers.find((row) => row.id === studentForm.id)?.avatar.url;

  return (
    <ProfileViewShell
      keepMountedTabs={false}
      title="Student Details"
      subtitle={pageSubtitle}
      avatar={
        avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={72}
            height={72}
            unoptimized
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : mockAvatar ? (
          <Image
            src={mockAvatar}
            alt=""
            width={72}
            height={72}
            unoptimized
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          getAvatarFallbackInitials(studentForm.fullName)
        )
      }
      name={studentForm.fullName}
      meta={`Teacher: ${studentForm.teacherName}`}
      badges={[
        { label: getProficiencyLevelById(studentForm.proficiencyLevelId)?.code ?? '—' },
        {
          label: getUserAccountStatusById(studentForm.statusId)?.name ?? '—',
          variant: studentForm.statusId === USER_ACCOUNT_STATUS.active.id ? 'green' : 'amber',
        },
        { label: studentForm.scheduleType ? 'Fixed schedule' : 'Flexible schedule' },
      ]}
      stats={[
        {
          value: achievementsLoading ? '…' : String(liveProfileStats.wordsLearned),
          label: 'Words',
        },
        {
          value: achievementsLoading ? '…' : String(liveProfileStats.lessonsCompleted),
          label: 'Lessons',
        },
        {
          value:
            achievementsLoading
              ? '…'
              : liveProfileStats.streakDays > 0
                ? String(liveProfileStats.streakDays)
                : '—',
          label: 'Streak',
        },
      ]}
      heroActions={
        studentBackendId && isTeacherAdminOrSuper(activeUser.role) ? (
          <Link
            href={`/chat?peer=${encodeURIComponent(studentBackendId)}`}
            className={styles.heroChatBtn}
            aria-label={`Open chat with ${studentForm.fullName}`}
            title="Open chat"
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
          label: 'Profile',
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
              onSave={() => {
                void (async () => {
                  setSaveError(null);
                  try {
                    if (
                      isAdminOrSuper(activeUser.role) &&
                      resolved.backendId &&
                      teacherBackendId !== resolved.teacherBackendId
                    ) {
                      await updateStudentAdmin(resolved.backendId, {
                        teacherId: teacherBackendId,
                      });
                      const teacherName =
                        teacherOptions.find((t) => t.backendId === teacherBackendId)
                          ?.fullName ?? '—';
                      setStudentForm((prev) => ({ ...prev, teacherName }));
                    }
                    if (resolved.backendId) {
                      const validColor =
                        studentForm.color && /^#[0-9a-fA-F]{6}$/.test(studentForm.color)
                          ? studentForm.color
                          : null;
                      if (activeUser.role === USER_ROLE.teacher.id) {
                        if (validColor) {
                          await updateStudentAdmin(resolved.backendId, {
                            displayColor: validColor,
                          });
                        }
                      } else if (isAdminOrSuper(activeUser.role)) {
                        await updateStudentAdmin(resolved.backendId, {
                          nativeLanguageId: nativeLanguageId || null,
                          learningLanguageIds: backendRow?.learningLanguageIds ?? [],
                          scheduleType: studentForm.scheduleType,
                          ...(validColor ? { displayColor: validColor } : {}),
                        });
                      }
                    }
                    const target = mockUsers.find((u) => u.id === studentForm.id);
                    if (target) {
                      target.fullName = studentForm.fullName;
                      target.email = studentForm.email;
                      target.phone = studentForm.phone;
                      target.timezoneId = studentForm.timezoneId;
                      target.proficiencyLevelId = studentForm.proficiencyLevelId;
                      target.statusId = studentForm.statusId;
                      target.scheduleType = studentForm.scheduleType;
                      target.color = studentForm.color;
                    }
                    setSavedProfile(true);
                    setTimeout(() => setSavedProfile(false), 2000);
                  } catch (err) {
                    setSaveError(err instanceof Error ? err.message : 'Failed to save');
                  }
                })();
              }}
            />
          ),
        },
        {
          value: 'statistics',
          label: 'Statistics',
          panel: studentBackendId && (tab === 'statistics' || visitedTabs.has('statistics')) ? (
            <StudentStatisticsTab studentId={studentBackendId} />
          ) : studentBackendId ? null : (
            <EmptyStateCard
              title="Statistics unavailable"
              description="Link this student to a backend account first."
            />
          ),
        },
        {
          value: 'lessons',
          label: 'Lessons',
          panel: tab === 'lessons' || visitedTabs.has('lessons') ? (
            <StudentLessonsTab lessons={lessons} />
          ) : null,
        },
        {
          value: 'billing',
          label: 'Billing',
          panel: studentBackendId && (tab === 'billing' || visitedTabs.has('billing')) ? (
            <StudentBillingTab
              studentBackendId={studentBackendId}
              canAdjust={isAdminOrSuper(activeUser.role)}
              isAdmin={isAdminOrSuper(activeUser.role)}
            />
          ) : studentBackendId ? null : (
            <EmptyStateCard
              title="Billing unavailable"
              description="Link this student to a backend account first."
            />
          ),
        },
        {
          value: 'achievements',
          label: 'Achievements',
          panel: tab === 'achievements' || visitedTabs.has('achievements') ? (
            <StudentAchievementsTab achievements={studentAchievements} />
          ) : null,
        },
        {
          value: 'vocabulary',
          label: 'Vocabulary',
          panel: resolved.backendId && (tab === 'vocabulary' || visitedTabs.has('vocabulary')) ? (
            <StudentVocabularyTab studentId={resolved.backendId} />
          ) : resolved.backendId ? null : (
            <EmptyStateCard
              title="Vocabulary unavailable"
              description="Link this student to a backend account first."
            />
          ),
        },
        {
          value: 'quiz',
          label: 'Quiz',
          panel: resolved.backendId && (tab === 'quiz' || visitedTabs.has('quiz')) ? (
            <StudentQuizTab studentId={resolved.backendId} />
          ) : resolved.backendId ? null : (
            <EmptyStateCard title="Quiz unavailable" description="Link this student to a backend account first." />
          ),
        },
      ]}
    />
  );
}
