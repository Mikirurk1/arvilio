import { escapeTelegramHtml } from '../infrastructure/telegram-bot.client';

export function telegramLessonReminder(vars: {
  displayName: string;
  lessonTitle: string;
  lessonDate: string;
  startTime: string;
  timezone: string;
  meetUrl: string;
}): string {
  return (
    `🔔 <b>Lesson in 30 minutes</b>\n\n` +
    `Hi ${escapeTelegramHtml(vars.displayName)},\n` +
    `<b>${escapeTelegramHtml(vars.lessonTitle)}</b>\n` +
    `${escapeTelegramHtml(vars.lessonDate)} ${escapeTelegramHtml(vars.startTime)} (${escapeTelegramHtml(vars.timezone)})\n\n` +
    `<a href="${escapeTelegramHtml(vars.meetUrl)}">Join lesson</a>`
  );
}

export function telegramStreakAlert(vars: {
  displayName: string;
  streakDays: number;
  appUrl: string;
}): string {
  return (
    `🔥 <b>Keep your streak</b>\n\n` +
    `Hi ${escapeTelegramHtml(vars.displayName)}, your ${vars.streakDays}-day streak is at risk today.\n\n` +
    `<a href="${escapeTelegramHtml(vars.appUrl)}">Practice now</a>`
  );
}

export function telegramWeeklyReport(vars: {
  displayName: string;
  lessonsThisWeek: number;
  lessonsCompleted: number;
  vocabularyCount: number;
  reviewCount: number;
  appUrl: string;
}): string {
  return (
    `📊 <b>Weekly report</b>\n\n` +
    `Hi ${escapeTelegramHtml(vars.displayName)},\n` +
    `Lessons this week: ${vars.lessonsThisWeek}\n` +
    `Completed: ${vars.lessonsCompleted}\n` +
    `Vocabulary: ${vars.vocabularyCount}\n` +
    `Reviews due: ${vars.reviewCount}\n\n` +
    `<a href="${escapeTelegramHtml(vars.appUrl)}">Open dashboard</a>`
  );
}

export function telegramNewVocab(vars: {
  displayName: string;
  word: string;
  definition: string;
  appUrl: string;
}): string {
  return (
    `📚 <b>Word of the day</b>\n\n` +
    `Hi ${escapeTelegramHtml(vars.displayName)},\n` +
    `<b>${escapeTelegramHtml(vars.word)}</b> — ${escapeTelegramHtml(vars.definition)}\n\n` +
    `<a href="${escapeTelegramHtml(vars.appUrl)}">Study vocabulary</a>`
  );
}

export function telegramTeacherMessage(vars: {
  displayName: string;
  teacherName: string;
  body: string;
  appUrl: string;
}): string {
  return (
    `💬 <b>Message from ${escapeTelegramHtml(vars.teacherName)}</b>\n\n` +
    `Hi ${escapeTelegramHtml(vars.displayName)},\n\n` +
    `${escapeTelegramHtml(vars.body)}\n\n` +
    `<a href="${escapeTelegramHtml(vars.appUrl)}">Open SoEnglish</a>`
  );
}
