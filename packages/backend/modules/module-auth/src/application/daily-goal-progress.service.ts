import { Injectable } from '@nestjs/common';
import { PracticeSessionKind, VocabularyStatus } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import type {
  DailyGoalInstance,
  DeepPracticeCriteria,
  GoalCriteria,
  GoalKind,
  PartOfSpeechGoal,
  QuizCriteria,
  SpeakingCriteria,
  VocabularyCriteria,
} from '@pkg/types';
import { utcDayRange } from '@pkg/types';

export type GoalProgressSnapshot = {
  current: number;
  target: number;
  label: string;
  done: boolean;
};

type DayActivity = {
  vocabCardsReviewed: number;
  vocabPracticeSec: number;
  vocabWordsAdded: number;
  vocabWordsAddedFromLesson: number;
  vocabWordsAddedByPos: Record<PartOfSpeechGoal, number>;
  vocabMistakesReviewed: number;
  vocabNewStatusReviewed: number;
  vocabLearnedStatusReviewed: number;
  vocabMarkedLearned: number;
  quizAttemptsFinished: number;
  quizPerfectAttempts: number;
  quizBestScorePercent: number;
  quizQuestionsAnswered: number;
  speakingSubmissions: number;
  speakingPracticeSec: number;
  totalPracticeSec: number;
  gamesPracticeSec: number;
  lessonsCompleted: number;
};

const POS_NEEDLES: Record<PartOfSpeechGoal, string[]> = {
  adjective: ['adjective', 'adj'],
  noun: ['noun'],
  verb: ['verb'],
  adverb: ['adverb', 'adv'],
};

function inUtcDay(d: Date, from: Date, to: Date): boolean {
  return d >= from && d < to;
}

function matchesPartOfSpeech(pos: string | null | undefined, target: PartOfSpeechGoal): boolean {
  const p = (pos ?? '').toLowerCase();
  if (!p) return false;
  return POS_NEEDLES[target].some((needle) => p.includes(needle));
}

@Injectable()
export class DailyGoalProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateForGoals(
    userId: string,
    goals: DailyGoalInstance[],
    dateKey: string,
  ): Promise<Map<string, GoalProgressSnapshot>> {
    const activity = await this.loadDayActivity(userId, dateKey);
    const out = new Map<string, GoalProgressSnapshot>();
    for (const goal of goals) {
      out.set(goal.id, this.evaluateGoal(goal.kind, goal.criteria, activity));
    }
    return out;
  }

  private async loadDayActivity(userId: string, dateKey: string): Promise<DayActivity> {
    const { from, to } = utcDayRange(dateKey);

    const [
      vocabCardsReviewed,
      vocabActivityRows,
      practiceSessions,
      quizAttempts,
      speakingSubmissions,
      lessonsCompleted,
    ] = await Promise.all([
      this.prisma.studentWordCard.count({
        where: {
          userId,
          lastReviewedAt: { gte: from, lt: to },
        },
      }),
      this.prisma.studentWordCard.findMany({
        where: {
          userId,
          OR: [
            { createdAt: { gte: from, lt: to } },
            { lastReviewedAt: { gte: from, lt: to } },
            { knownAt: { gte: from, lt: to } },
          ],
        },
        select: {
          createdAt: true,
          lastReviewedAt: true,
          knownAt: true,
          status: true,
          lessonId: true,
          word: { select: { partOfSpeech: true } },
        },
      }),
      this.prisma.practiceSession.findMany({
        where: { userId, startedAt: { gte: from, lt: to } },
        select: { kind: true, durationSec: true },
      }),
      this.prisma.quizAttempt.findMany({
        where: {
          studentId: userId,
          finishedAt: { not: null, gte: from, lt: to },
        },
        select: { score: true, correctCount: true, totalCount: true },
      }),
      this.prisma.speakingSubmission.count({
        where: {
          studentId: userId,
          submittedAt: { gte: from, lt: to },
        },
      }),
      this.prisma.scheduledLesson.count({
        where: {
          studentId: userId,
          status: 'COMPLETED',
          updatedAt: { gte: from, lt: to },
        },
      }),
    ]);

    let vocabWordsAdded = 0;
    let vocabWordsAddedFromLesson = 0;
    const vocabWordsAddedByPos: Record<PartOfSpeechGoal, number> = {
      adjective: 0,
      noun: 0,
      verb: 0,
      adverb: 0,
    };
    let vocabMistakesReviewed = 0;
    let vocabNewStatusReviewed = 0;
    let vocabLearnedStatusReviewed = 0;
    let vocabMarkedLearned = 0;

    for (const row of vocabActivityRows) {
      if (inUtcDay(row.createdAt, from, to)) {
        vocabWordsAdded += 1;
        if (row.lessonId) vocabWordsAddedFromLesson += 1;
        for (const pos of Object.keys(vocabWordsAddedByPos) as PartOfSpeechGoal[]) {
          if (matchesPartOfSpeech(row.word.partOfSpeech, pos)) {
            vocabWordsAddedByPos[pos] += 1;
          }
        }
      }
      if (row.lastReviewedAt && inUtcDay(row.lastReviewedAt, from, to)) {
        if (row.status === VocabularyStatus.MISTAKES_WORK) vocabMistakesReviewed += 1;
        if (row.status === VocabularyStatus.NEW) vocabNewStatusReviewed += 1;
        if (row.status === VocabularyStatus.LEARNED) vocabLearnedStatusReviewed += 1;
      }
      if (row.knownAt && inUtcDay(row.knownAt, from, to)) {
        vocabMarkedLearned += 1;
      }
    }

    let vocabPracticeSec = 0;
    let speakingPracticeSec = 0;
    let totalPracticeSec = 0;
    let gamesPracticeSec = 0;

    for (const session of practiceSessions) {
      totalPracticeSec += session.durationSec;
      if (session.kind === PracticeSessionKind.VOCABULARY) {
        vocabPracticeSec += session.durationSec;
      }
      if (session.kind === PracticeSessionKind.SPEAKING) {
        speakingPracticeSec += session.durationSec;
      }
      if (session.kind === PracticeSessionKind.GAMES) {
        gamesPracticeSec += session.durationSec;
      }
    }

    let quizBestScorePercent = 0;
    let quizQuestionsAnswered = 0;
    let quizPerfectAttempts = 0;
    for (const attempt of quizAttempts) {
      quizQuestionsAnswered += attempt.correctCount;
      const score =
        attempt.score ??
        (attempt.totalCount > 0 ? (attempt.correctCount / attempt.totalCount) * 100 : 0);
      if (score >= 99.5) quizPerfectAttempts += 1;
      if (score > quizBestScorePercent) quizBestScorePercent = score;
    }

    return {
      vocabCardsReviewed,
      vocabPracticeSec,
      vocabWordsAdded,
      vocabWordsAddedFromLesson,
      vocabWordsAddedByPos,
      vocabMistakesReviewed,
      vocabNewStatusReviewed,
      vocabLearnedStatusReviewed,
      vocabMarkedLearned,
      quizAttemptsFinished: quizAttempts.length,
      quizPerfectAttempts,
      quizBestScorePercent,
      quizQuestionsAnswered,
      speakingSubmissions,
      speakingPracticeSec,
      totalPracticeSec,
      gamesPracticeSec,
      lessonsCompleted,
    };
  }

  private evaluateGoal(
    kind: GoalKind,
    criteria: GoalCriteria,
    activity: DayActivity,
  ): GoalProgressSnapshot {
    switch (kind) {
      case 'vocabulary':
        return this.evaluateVocabulary(criteria as VocabularyCriteria, activity);
      case 'quiz':
        return this.evaluateQuiz(criteria as QuizCriteria, activity);
      case 'speaking':
        return this.evaluateSpeaking(criteria as SpeakingCriteria, activity);
      case 'deep_practice':
        return this.evaluateDeepPractice(criteria as DeepPracticeCriteria, activity);
      default:
        return { current: 0, target: 1, label: '', done: false };
    }
  }

  private evaluateVocabulary(criteria: VocabularyCriteria, activity: DayActivity): GoalProgressSnapshot {
    switch (criteria.mode) {
      case 'cards': {
        const current = activity.vocabCardsReviewed;
        return {
          current,
          target: criteria.targetCards,
          label: 'cards',
          done: current >= criteria.targetCards,
        };
      }
      case 'minutes': {
        const current = Math.floor(activity.vocabPracticeSec / 60);
        return {
          current,
          target: criteria.targetMinutes,
          label: 'min',
          done: current >= criteria.targetMinutes,
        };
      }
      case 'add_words': {
        const current = activity.vocabWordsAdded;
        return {
          current,
          target: criteria.targetWords,
          label: 'words',
          done: current >= criteria.targetWords,
        };
      }
      case 'add_from_lesson': {
        const current = activity.vocabWordsAddedFromLesson;
        return {
          current,
          target: criteria.targetWords,
          label: 'words',
          done: current >= criteria.targetWords,
        };
      }
      case 'add_part_of_speech': {
        const current = activity.vocabWordsAddedByPos[criteria.partOfSpeech];
        return {
          current,
          target: criteria.targetWords,
          label: 'words',
          done: current >= criteria.targetWords,
        };
      }
      case 'review_mistakes': {
        const current = activity.vocabMistakesReviewed;
        return {
          current,
          target: criteria.targetCards,
          label: 'cards',
          done: current >= criteria.targetCards,
        };
      }
      case 'review_new': {
        const current = activity.vocabNewStatusReviewed;
        return {
          current,
          target: criteria.targetCards,
          label: 'cards',
          done: current >= criteria.targetCards,
        };
      }
      case 'review_learned': {
        const current = activity.vocabLearnedStatusReviewed;
        return {
          current,
          target: criteria.targetCards,
          label: 'cards',
          done: current >= criteria.targetCards,
        };
      }
      case 'mark_learned': {
        const current = activity.vocabMarkedLearned;
        return {
          current,
          target: criteria.targetWords,
          label: 'words',
          done: current >= criteria.targetWords,
        };
      }
      default:
        return { current: 0, target: 1, label: '', done: false };
    }
  }

  private evaluateQuiz(criteria: QuizCriteria, activity: DayActivity): GoalProgressSnapshot {
    switch (criteria.mode) {
      case 'finish_one':
        return {
          current: activity.quizAttemptsFinished,
          target: 1,
          label: 'quiz',
          done: activity.quizAttemptsFinished >= 1,
        };
      case 'finish_count':
        return {
          current: activity.quizAttemptsFinished,
          target: criteria.targetQuizzes,
          label: 'quizzes',
          done: activity.quizAttemptsFinished >= criteria.targetQuizzes,
        };
      case 'score': {
        const current = Math.round(activity.quizBestScorePercent);
        return {
          current,
          target: criteria.minScorePercent,
          label: '%',
          done: activity.quizAttemptsFinished > 0 && current >= criteria.minScorePercent,
        };
      }
      case 'perfect':
        return {
          current: activity.quizPerfectAttempts,
          target: 1,
          label: 'perfect',
          done: activity.quizPerfectAttempts >= 1,
        };
      case 'questions':
        return {
          current: activity.quizQuestionsAnswered,
          target: criteria.minQuestions,
          label: 'questions',
          done: activity.quizQuestionsAnswered >= criteria.minQuestions,
        };
      default:
        return { current: 0, target: 1, label: '', done: false };
    }
  }

  private evaluateSpeaking(criteria: SpeakingCriteria, activity: DayActivity): GoalProgressSnapshot {
    switch (criteria.mode) {
      case 'submission':
        return {
          current: activity.speakingSubmissions,
          target: 1,
          label: 'recording',
          done: activity.speakingSubmissions >= 1,
        };
      case 'submissions':
        return {
          current: activity.speakingSubmissions,
          target: criteria.targetCount,
          label: 'recordings',
          done: activity.speakingSubmissions >= criteria.targetCount,
        };
      case 'minutes': {
        const current = Math.floor(activity.speakingPracticeSec / 60);
        return {
          current,
          target: criteria.targetMinutes,
          label: 'min',
          done: current >= criteria.targetMinutes || activity.speakingSubmissions >= 1,
        };
      }
      default:
        return { current: 0, target: 1, label: '', done: false };
    }
  }

  private evaluateDeepPractice(
    criteria: DeepPracticeCriteria,
    activity: DayActivity,
  ): GoalProgressSnapshot {
    switch (criteria.mode) {
      case 'lesson':
        return {
          current: activity.lessonsCompleted,
          target: 1,
          label: 'lesson',
          done: activity.lessonsCompleted >= 1,
        };
      case 'games_minutes': {
        const current = Math.floor(activity.gamesPracticeSec / 60);
        return {
          current,
          target: criteria.targetMinutes,
          label: 'min',
          done: current >= criteria.targetMinutes,
        };
      }
      case 'total_minutes': {
        const current = Math.floor(activity.totalPracticeSec / 60);
        return {
          current,
          target: criteria.targetMinutes,
          label: 'min',
          done: current >= criteria.targetMinutes || activity.lessonsCompleted >= 1,
        };
      }
      default:
        return { current: 0, target: 1, label: '', done: false };
    }
  }
}
