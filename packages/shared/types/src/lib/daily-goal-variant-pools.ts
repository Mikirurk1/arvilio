import type { GoalVariant } from './daily-goals';

/** Large pools of automatable goal copy — one variant per tier is picked daily via hash. */

export const vocabularyGoalVariants = [
  // Review volume
  { id: 'vocab-cards-5', text: 'Review 5 vocabulary flashcards today', criteria: { mode: 'cards', targetCards: 5 } },
  { id: 'vocab-cards-8', text: 'Review 8 vocabulary flashcards today', criteria: { mode: 'cards', targetCards: 8 } },
  { id: 'vocab-cards-10', text: 'Review 10 vocabulary flashcards today', criteria: { mode: 'cards', targetCards: 10 } },
  { id: 'vocab-cards-12', text: 'Review 12 flashcards in your deck today', criteria: { mode: 'cards', targetCards: 12 } },
  { id: 'vocab-cards-15', text: 'Review 15 flashcards before the day ends', criteria: { mode: 'cards', targetCards: 15 } },
  { id: 'vocab-min-3', text: 'Practice vocabulary for 3 minutes', criteria: { mode: 'minutes', targetMinutes: 3 } },
  { id: 'vocab-min-5', text: 'Practice vocabulary for 5 minutes', criteria: { mode: 'minutes', targetMinutes: 5 } },
  { id: 'vocab-min-8', text: 'Practice vocabulary for 8 minutes', criteria: { mode: 'minutes', targetMinutes: 8 } },
  { id: 'vocab-min-10', text: 'Spend 10 minutes in vocabulary practice', criteria: { mode: 'minutes', targetMinutes: 10 } },
  // Add words
  { id: 'vocab-add-1', text: 'Add 1 new word to your vocabulary today', criteria: { mode: 'add_words', targetWords: 1 } },
  { id: 'vocab-add-2', text: 'Add 2 new words to your deck today', criteria: { mode: 'add_words', targetWords: 2 } },
  { id: 'vocab-add-3', text: 'Add 3 new words you want to learn', criteria: { mode: 'add_words', targetWords: 3 } },
  { id: 'vocab-add-5', text: 'Grow your deck: add 5 words today', criteria: { mode: 'add_words', targetWords: 5 } },
  {
    id: 'vocab-add-lesson-2',
    text: 'Add 2 words from a recent lesson to your deck',
    criteria: { mode: 'add_from_lesson', targetWords: 2 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-lesson-3',
    text: 'Save 3 lesson words into your personal vocabulary',
    criteria: { mode: 'add_from_lesson', targetWords: 3 },
    actionPath: '/vocabulary',
  },
  // Part of speech — add
  {
    id: 'vocab-add-adj-1',
    text: 'Add 1 adjective to your vocabulary today',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'adjective', targetWords: 1 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-adj-2',
    text: 'Add 2 adjectives you can use in conversation',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'adjective', targetWords: 2 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-noun-2',
    text: 'Add 2 nouns to your word list today',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'noun', targetWords: 2 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-verb-1',
    text: 'Add 1 verb to practice this week',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'verb', targetWords: 1 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-verb-2',
    text: 'Add 2 action verbs to your deck',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'verb', targetWords: 2 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-adv-1',
    text: 'Add 1 adverb to sharpen your expressions',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'adverb', targetWords: 1 },
    actionPath: '/vocabulary',
  },
  // Mistakes & status
  {
    id: 'vocab-mistakes-3',
    text: 'Review 3 words marked for extra practice',
    criteria: { mode: 'review_mistakes', targetCards: 3 },
  },
  {
    id: 'vocab-mistakes-5',
    text: 'Clear 5 cards from your “needs review” pile',
    criteria: { mode: 'review_mistakes', targetCards: 5 },
  },
  {
    id: 'vocab-mistakes-8',
    text: 'Work through 8 mistake words today',
    criteria: { mode: 'review_mistakes', targetCards: 8 },
  },
  {
    id: 'vocab-new-5',
    text: 'Practice 5 brand-new cards in your deck',
    criteria: { mode: 'review_new', targetCards: 5 },
  },
  {
    id: 'vocab-new-8',
    text: 'Study 8 words you have not repeated yet',
    criteria: { mode: 'review_new', targetCards: 8 },
  },
  {
    id: 'vocab-learned-2',
    text: 'Mark 2 words as learned today',
    criteria: { mode: 'mark_learned', targetWords: 2 },
  },
  {
    id: 'vocab-learned-3',
    text: 'Move 3 words to learned status',
    criteria: { mode: 'mark_learned', targetWords: 3 },
  },
  {
    id: 'vocab-learned-5',
    text: 'Confirm 5 words you know well enough to mark learned',
    criteria: { mode: 'mark_learned', targetWords: 5 },
  },
  {
    id: 'vocab-review-learned-5',
    text: 'Refresh 5 words you already marked as learned',
    criteria: { mode: 'review_learned', targetCards: 5 },
  },
  {
    id: 'vocab-review-learned-8',
    text: 'Review 8 learned words to keep them active',
    criteria: { mode: 'review_learned', targetCards: 8 },
  },
  {
    id: 'vocab-add-4',
    text: 'Add 4 words you want to use this week',
    criteria: { mode: 'add_words', targetWords: 4 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-noun-3',
    text: 'Add 3 nouns (people, places, or things)',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'noun', targetWords: 3 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-add-adj-3',
    text: 'Add 3 adjectives to describe ideas more precisely',
    criteria: { mode: 'add_part_of_speech', partOfSpeech: 'adjective', targetWords: 3 },
    actionPath: '/vocabulary',
  },
  {
    id: 'vocab-cards-20',
    text: 'Review 20 flashcards in one study push',
    criteria: { mode: 'cards', targetCards: 20 },
  },
  {
    id: 'vocab-min-12',
    text: 'Study vocabulary for 12 minutes straight',
    criteria: { mode: 'minutes', targetMinutes: 12 },
  },
  {
    id: 'vocab-mistakes-10',
    text: 'Review 10 words from your mistake queue',
    criteria: { mode: 'review_mistakes', targetCards: 10 },
  },
  {
    id: 'vocab-new-10',
    text: 'Practice 10 new cards you have not repeated yet',
    criteria: { mode: 'review_new', targetCards: 10 },
  },
] satisfies GoalVariant[];

export const quizGoalVariants = [
  { id: 'quiz-finish-1', text: 'Complete one quiz today', criteria: { mode: 'finish_one' } },
  { id: 'quiz-finish-2', text: 'Finish 2 quizzes today', criteria: { mode: 'finish_count', targetQuizzes: 2 } },
  { id: 'quiz-score-60', text: 'Score at least 60% on a quiz today', criteria: { mode: 'score', minScorePercent: 60 } },
  { id: 'quiz-score-70', text: 'Score at least 70% on a quiz today', criteria: { mode: 'score', minScorePercent: 70 } },
  { id: 'quiz-score-80', text: 'Score at least 80% on a quiz today', criteria: { mode: 'score', minScorePercent: 80 } },
  { id: 'quiz-score-90', text: 'Score at least 90% on a quiz today', criteria: { mode: 'score', minScorePercent: 90 } },
  { id: 'quiz-perfect-1', text: 'Get 100% on at least one quiz today', criteria: { mode: 'perfect' } },
  { id: 'quiz-questions-10', text: 'Answer 10 quiz questions correctly today', criteria: { mode: 'questions', minQuestions: 10 } },
  { id: 'quiz-questions-15', text: 'Answer 15 quiz questions today', criteria: { mode: 'questions', minQuestions: 15 } },
  { id: 'quiz-questions-20', text: 'Answer 20 quiz questions today', criteria: { mode: 'questions', minQuestions: 20 } },
  { id: 'quiz-questions-25', text: 'Answer 25 quiz questions in quizzes today', criteria: { mode: 'questions', minQuestions: 25 } },
  {
    id: 'quiz-score-70-2',
    text: 'Complete 2 quizzes with at least 70% each',
    criteria: { mode: 'finish_count', targetQuizzes: 2 },
  },
  {
    id: 'quiz-warmup',
    text: 'Warm up with one short quiz (any score)',
    criteria: { mode: 'finish_one' },
  },
  {
    id: 'quiz-focus',
    text: 'Do one focused quiz and hit 75% or higher',
    criteria: { mode: 'score', minScorePercent: 75 },
  },
  { id: 'quiz-score-85', text: 'Reach 85% on a quiz today', criteria: { mode: 'score', minScorePercent: 85 } },
  { id: 'quiz-questions-30', text: 'Answer 30 questions across quizzes', criteria: { mode: 'questions', minQuestions: 30 } },
  { id: 'quiz-finish-3', text: 'Complete 3 quizzes today', criteria: { mode: 'finish_count', targetQuizzes: 3 } },
] satisfies GoalVariant[];

export const speakingGoalVariants = [
  { id: 'speak-submit-1', text: 'Submit one speaking recording today', criteria: { mode: 'submission' } },
  { id: 'speak-submit-2', text: 'Submit 2 speaking recordings today', criteria: { mode: 'submissions', targetCount: 2 } },
  { id: 'speak-min-1', text: 'Practice speaking aloud for 1 minute', criteria: { mode: 'minutes', targetMinutes: 1 } },
  { id: 'speak-min-2', text: 'Practice speaking for 2 minutes', criteria: { mode: 'minutes', targetMinutes: 2 } },
  { id: 'speak-min-3', text: 'Spend 3 minutes on speaking practice', criteria: { mode: 'minutes', targetMinutes: 3 } },
  { id: 'speak-min-5', text: 'Practice speaking for 5 minutes today', criteria: { mode: 'minutes', targetMinutes: 5 } },
  {
    id: 'speak-topic-1',
    text: 'Record yourself on one speaking topic',
    criteria: { mode: 'submission' },
  },
  {
    id: 'speak-daily',
    text: 'Send in a daily speaking check-in (1 recording)',
    criteria: { mode: 'submission' },
  },
  {
    id: 'speak-confidence',
    text: 'Practice speaking for 2 minutes or submit a recording',
    criteria: { mode: 'minutes', targetMinutes: 2 },
  },
  {
    id: 'speak-double',
    text: 'Submit 2 recordings on different topics',
    criteria: { mode: 'submissions', targetCount: 2 },
  },
  {
    id: 'speak-submit-3',
    text: 'Submit 3 speaking recordings today',
    criteria: { mode: 'submissions', targetCount: 3 },
  },
  {
    id: 'speak-min-4',
    text: 'Practice speaking aloud for 4 minutes',
    criteria: { mode: 'minutes', targetMinutes: 4 },
  },
] satisfies GoalVariant[];

export const deepPracticeGoalVariants = [
  { id: 'deep-min-8', text: 'Log 8 minutes of practice today', criteria: { mode: 'total_minutes', targetMinutes: 8 } },
  { id: 'deep-min-10', text: 'Log 10 minutes of practice today', criteria: { mode: 'total_minutes', targetMinutes: 10 } },
  { id: 'deep-min-12', text: 'Spend 12 minutes learning in the app', criteria: { mode: 'total_minutes', targetMinutes: 12 } },
  { id: 'deep-min-15', text: 'Log 15 minutes of practice today', criteria: { mode: 'total_minutes', targetMinutes: 15 } },
  { id: 'deep-min-20', text: 'Log 20 minutes of practice today', criteria: { mode: 'total_minutes', targetMinutes: 20 } },
  { id: 'deep-min-25', text: 'Put in 25 minutes of focused practice', criteria: { mode: 'total_minutes', targetMinutes: 25 } },
  { id: 'deep-lesson-1', text: 'Complete one lesson today', criteria: { mode: 'lesson' } },
  {
    id: 'deep-games-3',
    text: 'Practice irregular verbs for 3 minutes',
    criteria: { mode: 'games_minutes', targetMinutes: 3 },
    actionPath: '/practice/irregular-verbs',
  },
  {
    id: 'deep-games-5',
    text: 'Spend 5 minutes in grammar games',
    criteria: { mode: 'games_minutes', targetMinutes: 5 },
    actionPath: '/practice/irregular-verbs',
  },
  {
    id: 'deep-games-8',
    text: 'Train with irregular verbs for 8 minutes',
    criteria: { mode: 'games_minutes', targetMinutes: 8 },
    actionPath: '/practice/irregular-verbs',
  },
  {
    id: 'deep-lesson-or-10',
    text: 'Complete a lesson or log 10 minutes of practice',
    criteria: { mode: 'total_minutes', targetMinutes: 10 },
  },
  {
    id: 'deep-mix',
    text: 'Mix it up: 15 minutes across any practice areas',
    criteria: { mode: 'total_minutes', targetMinutes: 15 },
  },
  {
    id: 'deep-study-block',
    text: 'Do a 20-minute study block in SoEnglish',
    criteria: { mode: 'total_minutes', targetMinutes: 20 },
  },
] satisfies GoalVariant[];
