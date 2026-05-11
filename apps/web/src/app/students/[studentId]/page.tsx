'use client';

import { useMemo, useState } from 'react';
import type { LessonRecurrence, ScheduledLessonDto } from '@soenglish/shared-types';
import { LESSON_STATUS } from '@soenglish/shared-types';
import { useParams } from 'next/navigation';
import { EmptyStateCard } from '../../../components/ui';
import { ProfileViewShell } from '../../../components/profile/ProfileViewShell';
import { lessonStartUtc } from '../../../lib/lessonTime';
import { calculateEndTime, nextLessonEntityId } from '../../../features/calendar/adapters/lessonCalendarAdapter';
import {
  activeMockUser,
  buildProfileAchievements,
  canView,
  canManageProfile,
  emptyProfileStats,
  getProfileByUserId,
  getProficiencyLevelById,
  getStudentScheduledLessons,
  getUserAccountStatusById,
  isTeacherAdminOrSuper,
  mockProfileStatsByUserId,
  mockScheduledLessons,
  mockUsers,
  USER_ACCOUNT_STATUS,
  type MockStudent,
} from '../../../mocks';
import { getAvatarFallbackInitials } from '../../../lib/avatar';
import {
  StudentAchievementsTab,
  StudentLessonsTab,
  StudentProfileTab,
  StudentScheduleTab,
  StudentStatisticsTab,
} from './sections';
import { StudentVocabularyTab } from './StudentVocabularyTab';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  Gem,
  GraduationCap,
  MessageSquareText,
  Mic,
  Mountain,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react';

export default function StudentDetailsPage() {
  const params = useParams<{ studentId: string }>();
  const rawStudentId = params?.studentId;
  const studentIdNum =
    rawStudentId !== undefined && rawStudentId !== '' ? Number(rawStudentId) : Number.NaN;
  const student = Number.isFinite(studentIdNum) ? getProfileByUserId(studentIdNum) : undefined;

  if (!canView('dashboard', activeMockUser.role)) return null;
  const allowedRoles = isTeacherAdminOrSuper(activeMockUser.role);
  if (!allowedRoles) {
    return <EmptyStateCard title="No permission" description="Students section is not available for your role." />;
  }
  if (!student) {
    return <EmptyStateCard title="Student not found" description="Check the student link and try again." />;
  }
  const canManage = canManageProfile(activeMockUser, student);
  if (!canManage) {
    return <EmptyStateCard title="No permission" description="You cannot manage this student." />;
  }

  const [tab, setTab] = useState<
    'profile' | 'statistics' | 'lessons' | 'schedule' | 'achievements' | 'vocabulary'
  >('profile');
  const [studentForm, setStudentForm] = useState<MockStudent>(student);
  const [savedProfile, setSavedProfile] = useState(false);
  const [lessons, setLessons] = useState<ScheduledLessonDto[]>(() =>
    [...getStudentScheduledLessons(student.id)].sort(
      (a, b) => lessonStartUtc(a).getTime() - lessonStartUtc(b).getTime(),
    ),
  );
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurrence, setRecurrence] = useState<LessonRecurrence>('none');
  const [comment, setComment] = useState('');

  const pageSubtitle = useMemo(() => 'Manage student profile, lessons and scheduling', []);
  const achievementIconMap = {
    sparkles: <Sparkles size={20} />,
    'graduation-cap': <GraduationCap size={20} />,
    'calendar-check': <CalendarCheck size={20} />,
    flame: <Flame size={20} />,
    'book-open': <BookOpen size={20} />,
    brain: <Brain size={20} />,
    'messages-square': <MessageSquareText size={20} />,
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

  const studentStats =
    mockProfileStatsByUserId.find((entry) => entry.userId === studentForm.userId)?.stats ??
    emptyProfileStats;

  const studentAchievements = buildProfileAchievements(studentStats).map((achievement) => ({
    icon: achievementIconMap[achievement.icon],
    label: achievement.label,
    description: achievement.description,
    unlocked: achievement.unlocked,
  }));
  const recentUnlockedAchievements = studentAchievements.filter((achievement) => achievement.unlocked).slice(-10);

  return (
    <ProfileViewShell
      title="Student Details"
      subtitle={pageSubtitle}
      avatar={(() => {
        const u = mockUsers.find((row) => row.id === studentForm.id);
        return u?.avatar.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.avatar.url} alt="" width={72} height={72} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          getAvatarFallbackInitials(studentForm.fullName)
        );
      })()}
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
        { value: studentForm.wordsLearned, label: 'Words' },
        { value: studentForm.lessonsCompleted, label: 'Lessons' },
        { value: studentForm.streakDays, label: 'Streak' },
      ]}
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
                viewerRole={activeMockUser.role}
                saved={savedProfile}
                onSave={() => {
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
                }}
              />
            ),
          },
          {
            value: 'statistics',
            label: 'Statistics',
            panel: (
              <StudentStatisticsTab
                roleId={activeMockUser.role}
                currentUserId={activeMockUser.id}
                studentId={studentForm.userId}
              />
            ),
          },
          {
            value: 'lessons',
            label: 'Lessons',
            panel: <StudentLessonsTab lessons={lessons} />,
          },
          {
            value: 'schedule',
            label: 'Schedule',
            panel: (
              <StudentScheduleTab
                canEdit={canManage}
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                recurrence={recurrence}
                setRecurrence={setRecurrence}
                comment={comment}
                setComment={setComment}
                onPlan={() => {
                  const newLesson: ScheduledLessonDto = {
                    id: nextLessonEntityId([...mockScheduledLessons, ...lessons]),
                    title: comment.trim() ? comment.trim().slice(0, 80) : 'Scheduled lesson',
                    date,
                    startTime: time,
                    endTime: calculateEndTime(time, 55),
                    duration: 55,
                    timezoneId: activeMockUser.timezoneId,
                    teacherId: studentForm.teacherId,
                    teacherName: studentForm.teacherName,
                    studentId: studentForm.id,
                    studentName: studentForm.fullName,
                    statusId: LESSON_STATUS.planned.id,
                    credited: false,
                    notes: comment,
                    order: 1,
                    recurrence,
                    weeklyDays: recurrence === 'weekly' ? [] : [],
                  };
                  setLessons((prev) => [...prev, newLesson]);
                  setDate('');
                  setTime('');
                  setRecurrence('none');
                  setComment('');
                  setTab('lessons');
                }}
              />
            ),
          },
          {
            value: 'achievements',
            label: 'Achievements',
            panel: <StudentAchievementsTab achievements={studentAchievements} />,
          },
          {
            value: 'vocabulary',
            label: 'Vocabulary',
            panel: (
              <StudentVocabularyTab studentUserId={studentForm.userId} />
            ),
          },
      ]}
    />
  );
}
