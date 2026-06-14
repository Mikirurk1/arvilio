'use client';

import {
  BadgeCheck, BookOpen, Brain, CalendarCheck, Crown, Flame, Gem,
  GraduationCap, MessageSquareText, Mic, Mountain, Rocket, Sparkles, Star, Target, Trophy,
} from 'lucide-react';

export const achievementIconMap = {
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

type AchievementSource = {
  icon: keyof typeof achievementIconMap;
  label: string;
  description: string;
  unlocked: boolean;
};

export function buildAllAchievements(achievements: AchievementSource[]) {
  return achievements.map((a) => ({
    icon: achievementIconMap[a.icon],
    label: a.label,
    description: a.description,
    unlocked: a.unlocked,
  }));
}
