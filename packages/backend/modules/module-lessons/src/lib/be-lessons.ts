import { Controller, Get, Module } from '@nestjs/common';
import { LessonDto, QuizQuestionDto } from '@soenglish/shared-types';

const lessons: LessonDto[] = [
  {
    id: '1',
    title: 'Second & Third Conditionals',
    level: 'B2',
    duration: 55,
    xp: 30,
    difficulty: 'medium',
    description: 'Learn to express hypothetical situations and past regrets with conditional sentences.',
    completed: false,
    locked: false,
  },
  {
    id: '2',
    title: 'Finance & Investment Terms',
    level: 'B2',
    duration: 55,
    xp: 25,
    difficulty: 'easy',
    description: '15 essential words for business communication: equity, yield, portfolio, and more.',
    completed: true,
    locked: false,
  },
  {
    id: '3',
    title: 'Present a Project Proposal',
    level: 'B2',
    duration: 55,
    xp: 40,
    difficulty: 'hard',
    description: 'Role-play a business meeting: pitching ideas, handling questions, and wrapping up confidently.',
    completed: false,
    locked: false,
  },
  {
    id: '4',
    title: 'Podcast Comprehension',
    level: 'B2',
    duration: 55,
    xp: 35,
    difficulty: 'hard',
    description: 'Improve your listening skills through authentic podcast content.',
    completed: false,
    locked: true,
  },
  {
    id: '5',
    title: 'Passive Voice in Context',
    level: 'B1',
    duration: 55,
    xp: 25,
    difficulty: 'easy',
    description: 'Master the passive voice across all tenses with real-world examples.',
    completed: true,
    locked: false,
  },
  {
    id: '6',
    title: 'Idioms & Expressions',
    level: 'B2',
    duration: 55,
    xp: 30,
    difficulty: 'medium',
    description: 'Common English idioms used in everyday and professional conversations.',
    completed: false,
    locked: false,
  },
];

const quizQuestions: QuizQuestionDto[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'Choose the correct conditional sentence:',
    options: [
      'If I would have more time, I will study harder.',
      'If I had more time, I would study harder.',
      'If I have more time, I would study harder.',
      'If I had more time, I will study harder.',
    ],
    correct: 1,
    explanation: "The second conditional uses 'if + past simple, would + infinitive'.",
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: "What does 'eloquent' mean?",
    options: [
      'Speaking very loudly and clearly',
      'Unable to express oneself clearly',
      'Fluent and persuasive in speech or writing',
      'Using complex and confusing language',
    ],
    correct: 2,
    explanation: 'Eloquent means able to express ideas fluently and persuasively.',
  },
  {
    id: 'q3',
    type: 'fill-in',
    question: "Complete: 'If they _____ (arrive) earlier, they would have seen the presentation.'",
    correct: 'had arrived',
    explanation: "Third conditional: 'if + past perfect, would have + past participle'.",
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    question: 'Which sentence uses the passive voice correctly?',
    options: [
      'The report was written by the manager yesterday.',
      'The manager was written the report yesterday.',
      'The report has been writing by the manager.',
      'The manager written the report yesterday.',
    ],
    correct: 0,
    explanation: "Passive voice: 'was/were + past participle'.",
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    question: "What does 'leverage' mean in a business context?",
    options: [
      'To physically lift heavy objects',
      'To use something to maximum advantage',
      'To borrow money from a bank',
      'To reduce company expenses',
    ],
    correct: 1,
    explanation: "In business, 'leverage' means to use resources for best possible outcome.",
  },
  {
    id: 'q6',
    type: 'multiple-choice',
    question:
      "Choose the most appropriate word: 'Her ___ explanation helped everyone understand the complex topic.'",
    options: ['ambiguous', 'coherent', 'nuanced', 'pivotal'],
    correct: 1,
    explanation: "'Coherent' means logical and consistent.",
  },
];

@Controller()
export class LessonsController {
  @Get('lessons')
  getLessons(): LessonDto[] {
    return lessons;
  }

  @Get('quiz')
  getQuizQuestions(): QuizQuestionDto[] {
    return quizQuestions;
  }
}

@Module({
  controllers: [LessonsController],
})
export class LessonsModule {}
