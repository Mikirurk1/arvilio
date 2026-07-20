import { EMPTY_ACHIEVEMENT_STATS } from '@pkg/types';
import {
  buildProfileAchievements,
  computeUnlockedAchievementIdsFromCounters,
} from './achievements';

describe('achievements', () => {
  it('computes unlocked ids from live counters', () => {
    const ids = computeUnlockedAchievementIdsFromCounters(
      {
        wordsLearned: 1000,
        lessonsCompleted: 50,
        streakDays: 14,
        quizzesCompleted: 40,
        perfectQuizCount: 10,
        speakingSessions: 30,
        speakingSubmissions: 10,
        speakingReviewsReceived: 5,
        speakingMinutesTotal: 120,
        gamesSessions: 30,
        practiceMinutesTotal: 600,
        lessonMinutesTotal: 1500,
        weeklyGoalsCompleted: 3,
      },
      { profileComplete: true },
    );

    expect(ids).toEqual(
      expect.arrayContaining([
        'ach_welcome_aboard',
        'ach_lessons_50',
        'ach_words_1000',
        'ach_streak_14',
        'ach_quizzes_40',
        'ach_perfect_quiz_10',
        'ach_speaking_30',
        'ach_speaking_record_10',
        'ach_speaking_feedback_5',
        'ach_speaking_minutes_60',
        'ach_irregular_drills_30',
        'ach_consistency_master',
        'ach_elite_learner',
        'ach_profile_complete',
      ]),
    );
  });

  it('builds unlocked cards from counters when unlocked ids are absent', () => {
    const achievements = buildProfileAchievements(
      {
        ...EMPTY_ACHIEVEMENT_STATS,
        wordsLearned: 120,
        lessonsCompleted: 10,
        streakDays: 7,
        quizzesCompleted: 1,
        perfectQuizCount: 1,
        speakingSessions: 3,
        speakingSubmissions: 1,
        speakingReviewsReceived: 0,
        speakingMinutesTotal: 0,
        gamesSessions: 1,
      },
      { profileComplete: true },
    );

    expect(achievements.find((row) => row.label === 'Welcome Aboard')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === '10 Lessons Done')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === '100 Words')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === '7-Day Streak')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === 'First Quiz')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === '100% Quiz')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === 'Conversation Starter')?.unlocked).toBe(
      true,
    );
    expect(achievements.find((row) => row.label === 'First Recording')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === 'First Drill')?.unlocked).toBe(true);
    expect(achievements.find((row) => row.label === 'Profile Complete')?.unlocked).toBe(true);
  });
});

