'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyStateCard } from '../../../components/ui';
import { ProfileViewShell } from '../../../components/profile/ProfileViewShell';
import { buildLiveProfileStats } from '../../../lib/profile-live-stats';
import { buildStudentLessonList } from '../../../lib/student-lessons';
import { filterLessonsForStudent } from '../../../lib/student-live-stats';
import { useStudentLiveStats } from '../../../hooks/use-student-live-stats';
import { useLessonsStore } from '../../../stores/lessons-store';
import {
  buildProfileAchievements,
  canView,
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
  StudentAchievementsTab,
  StudentLessonsTab,
  StudentProfileTab,
  StudentStatisticsTab,
} from './sections';
import { StudentVocabularyTab } from './StudentVocabularyTab';
import { StudentQuizTab } from './StudentQuizTab';
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
  const fetchScheduledLessons = useLessonsStore((s) => s.fetchScheduledLessons);
  const backendLessons = useLessonsStore((s) => s.backendLessons);

  const allowedRoles = isTeacherAdminOrSuper(activeUser.role);
  const backendRow = list.data?.find((row) => row.id === studentId);
  const resolved = useMemo(
    () => resolveStudentProfile(studentId, list.data ?? undefined),
    [studentId, list.data],
  );

  const [tab, setTab] = useState<
    'profile' | 'statistics' | 'lessons' | 'achievements' | 'vocabulary' | 'quiz'
  >('profile');
  const [studentForm, setStudentForm] = useState<MockStudent>(EMPTY_STUDENT);
  const [teacherBackendId, setTeacherBackendId] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nativeLanguageId, setNativeLanguageId] = useState('');
  const studentBackendId = resolved?.backendId;
  const {
    loading: liveStatsLoading,
    summary: liveSummary,
    overview: liveOverview,
    studentLessons: liveStudentLessons,
  } = useStudentLiveStats(studentBackendId);

  useEffect(() => {
    if (allowedRoles) void fetchStudents();
  }, [allowedRoles, fetchStudents]);

  useEffect(() => {
    if (allowedRoles) void fetchScheduledLessons(true);
  }, [allowedRoles, fetchScheduledLessons]);

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

  const liveProfileStats = useMemo(
    () =>
      buildLiveProfileStats(
        liveSummary ?? undefined,
        liveOverview ?? undefined,
        liveStudentLessons.length > 0 ? liveStudentLessons : undefined,
      ),
    [liveOverview, liveStudentLessons, liveSummary],
  );

  const studentAchievements = buildProfileAchievements(liveProfileStats).map((achievement) => ({
    icon: achievementIconMap[achievement.icon],
    label: achievement.label,
    description: achievement.description,
    unlocked: achievement.unlocked,
  }));
  const recentUnlockedAchievements = studentAchievements
    .filter((achievement) => achievement.unlocked)
    .slice(-10);

  if (!canView('dashboard', activeUser.role)) return null;

  if (!allowedRoles) {
    return (
      <EmptyStateCard
        title="No permission"
        description="Students section is not available for your role."
      />
    );
  }

  const loading = list.status === 'loading' || list.status === 'idle';
  if (loading && !resolved) {
    return <EmptyStateCard title="Loading student…" description="Please wait." />;
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
          value: liveStatsLoading ? '…' : String(liveProfileStats.wordsLearned),
          label: 'Words',
        },
        {
          value: liveStatsLoading ? '…' : String(liveProfileStats.lessonsCompleted),
          label: 'Lessons',
        },
        {
          value: liveStatsLoading ? '…' : (liveProfileStats.streakDays > 0 ? String(liveProfileStats.streakDays) : '—'),
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
      onTabChange={setTab}
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
          panel: studentBackendId ? (
            <StudentStatisticsTab studentId={studentBackendId} />
          ) : (
            <EmptyStateCard
              title="Statistics unavailable"
              description="Link this student to a backend account first."
            />
          ),
        },
        {
          value: 'lessons',
          label: 'Lessons',
          panel: <StudentLessonsTab lessons={lessons} />,
        },
        {
          value: 'achievements',
          label: 'Achievements',
          panel: <StudentAchievementsTab achievements={studentAchievements} />,
        },
        {
          value: 'vocabulary',
          label: 'Vocabulary',
          panel: resolved.backendId ? (
            <StudentVocabularyTab studentId={resolved.backendId} />
          ) : (
            <EmptyStateCard
              title="Vocabulary unavailable"
              description="Link this student to a backend account first."
            />
          ),
        },
        {
          value: 'quiz',
          label: 'Quiz',
          panel: resolved.backendId ? (
            <StudentQuizTab studentId={resolved.backendId} />
          ) : (
            <EmptyStateCard title="Quiz unavailable" description="Link this student to a backend account first." />
          ),
        },
      ]}
    />
  );
}
