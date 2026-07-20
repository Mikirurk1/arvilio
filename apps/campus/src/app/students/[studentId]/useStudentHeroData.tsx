'use client';

import { useMemo } from 'react';
import {
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarCheck,
  Coins,
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
import { buildProfileAchievements } from '../../../lib/achievements';
import {
  getProficiencyLevelById,
  getUserAccountStatusById,
  USER_ACCOUNT_STATUS,
  USER_ROLE,
  type UserAccountStatusId,
} from '@pkg/types';
import type { MockStudent } from '../../../lib/user-models';
import {
  formatMinor,
  headerGroupStatLabel,
  splitStudentBillingTracks,
} from '../../../lib/billing/student-billing-tracks';
import { getLessonFormatLabel } from '../../../lib/student-lesson-format';
import type { TranslateFn } from '../../../lib/cms/nav-i18n';
import type { AchievementStatsDto, StudentLessonFormat, UserRoleId } from '@pkg/types';

type BillingTracks = ReturnType<typeof splitStudentBillingTracks> | null;

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

function accountStatusLabel(statusId: UserAccountStatusId, t?: TranslateFn): string {
  const entry = getUserAccountStatusById(statusId);
  if (!entry) return '—';
  if (!t) return entry.name;
  const key = `students.status.${entry.name}`;
  const label = t(key);
  return label === key ? entry.name : label;
}

interface UseStudentHeroDataOptions {
  liveProfileStats: AchievementStatsDto;
  achievementsLoading: boolean;
  billingTracks: BillingTracks;
  groupLessonsEnabled: boolean;
  activeUserRole: UserRoleId;
  studentForm: MockStudent;
  lessonFormat: StudentLessonFormat;
  t?: TranslateFn;
}

export function useStudentHeroData({
  liveProfileStats,
  achievementsLoading,
  billingTracks,
  groupLessonsEnabled,
  activeUserRole,
  studentForm,
  lessonFormat,
  t,
}: UseStudentHeroDataOptions) {
  const studentAchievements = useMemo(
    () =>
      buildProfileAchievements(liveProfileStats).map((achievement) => ({
        icon: achievementIconMap[achievement.icon],
        label: achievement.label,
        description: achievement.description,
        unlocked: achievement.unlocked,
      })),
    [liveProfileStats],
  );

  const recentUnlockedAchievements = useMemo(
    () => studentAchievements.filter((a) => a.unlocked).slice(-10),
    [studentAchievements],
  );

  const heroStats = useMemo(() => {
    const wordsLabel = t?.('students.card.words') ?? 'Words';
    const lessonsLabel = t?.('students.card.lessons') ?? 'Lessons';
    const streakLabel = t?.('students.card.streak') ?? 'Streak';
    const debtSuffix = (isDebt: boolean) =>
      isDebt ? ` · ${t?.('students.detail.debt') ?? 'debt'}` : '';

    const base = [
      {
        value: achievementsLoading ? '…' : String(liveProfileStats.wordsLearned),
        label: wordsLabel,
        icon: <BookOpen size={15} aria-hidden />,
        iconTone: 'green' as const,
      },
      {
        value: achievementsLoading ? '…' : String(liveProfileStats.lessonsCompleted),
        label: lessonsLabel,
        icon: <CalendarCheck size={15} aria-hidden />,
        iconTone: 'blue' as const,
      },
      {
        value:
          achievementsLoading
            ? '…'
            : liveProfileStats.streakDays > 0
              ? String(liveProfileStats.streakDays)
              : '—',
        label: streakLabel,
        icon: <Flame size={15} aria-hidden />,
        iconTone: 'amber' as const,
      },
    ];
    if (!groupLessonsEnabled || !billingTracks) return base;
    const isTeacherViewer = activeUserRole === USER_ROLE.teacher.id;
    const extra: typeof base = [];
    if (billingTracks.showIndividual && billingTracks.individual) {
      const ind = billingTracks.individual;
      const priceLabel = formatMinor(ind.resolvedPricePerLessonMinor, ind.defaultCurrency);
      extra.push({
        value: `${ind.balance}${debtSuffix(ind.isDebt)}`,
        label: isTeacherViewer
          ? (t?.('students.detail.balanceIndividual') ?? 'Individual balance')
          : (t?.('students.detail.balanceIndividualRate', { price: priceLabel }) ??
            `Individual balance · ${priceLabel}/lesson`),
        icon: <Coins size={15} aria-hidden />,
        iconTone: 'blue' as const,
      });
    }
    if (billingTracks.showGroup && billingTracks.group) {
      extra.push({
        value: headerGroupStatLabel(billingTracks.group),
        label: t?.('students.detail.balanceGroup') ?? 'Group billing',
        icon: <GraduationCap size={15} aria-hidden />,
        iconTone: 'green' as const,
      });
    }
    return [...extra, ...base];
  }, [
    achievementsLoading,
    activeUserRole,
    billingTracks,
    groupLessonsEnabled,
    liveProfileStats,
    t,
  ]);

  const profileBadges = useMemo(() => {
    const items: Array<{ label: string; variant?: 'green' | 'amber' | 'blue' }> = [
      { label: getProficiencyLevelById(studentForm.proficiencyLevelId)?.code ?? '—' },
      {
        label: accountStatusLabel(studentForm.statusId, t),
        variant: studentForm.statusId === USER_ACCOUNT_STATUS.active.id ? 'green' : 'amber',
      },
      {
        label: studentForm.scheduleType
          ? (t?.('students.detail.scheduleFixed') ?? 'Fixed schedule')
          : (t?.('students.detail.scheduleFlexible') ?? 'Flexible schedule'),
      },
    ];
    if (groupLessonsEnabled) {
      items.push({ label: getLessonFormatLabel(lessonFormat, t), variant: 'blue' });
    }
    return items;
  }, [
    groupLessonsEnabled,
    lessonFormat,
    studentForm.proficiencyLevelId,
    studentForm.scheduleType,
    studentForm.statusId,
    t,
  ]);

  return { heroStats, profileBadges, studentAchievements, recentUnlockedAchievements };
}
