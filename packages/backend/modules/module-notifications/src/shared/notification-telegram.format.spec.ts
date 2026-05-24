import {
  telegramLessonReminder,
  telegramNewVocab,
  telegramStreakAlert,
  telegramTeacherMessage,
  telegramWeeklyReport,
} from './notification-telegram.format';

describe('notification-telegram.format', () => {
  it('escapes html in lesson reminder', () => {
    const text = telegramLessonReminder({
      displayName: 'A & B',
      lessonTitle: 'Test <script>',
      lessonDate: '2026-05-20',
      startTime: '10:00',
      timezone: 'UTC',
      meetUrl: 'https://meet.example/x',
    });
    expect(text).toContain('Lesson in 30 minutes');
    expect(text).not.toContain('<script>');
  });

  it('formats streak alert with link', () => {
    const text = telegramStreakAlert({
      displayName: 'Student',
      streakDays: 5,
      appUrl: 'https://app.test',
    });
    expect(text).toContain('5-day');
    expect(text).toContain('https://app.test');
  });

  it('formats weekly report and vocab', () => {
    expect(
      telegramWeeklyReport({
        displayName: 'S',
        lessonsThisWeek: 2,
        lessonsCompleted: 1,
        vocabularyCount: 10,
        reviewCount: 3,
        appUrl: 'https://app.test',
      }),
    ).toContain('Weekly report');
    expect(
      telegramNewVocab({
        displayName: 'S',
        word: 'hello',
        definition: 'greeting',
        appUrl: 'https://app.test',
      }),
    ).toContain('hello');
  });

  it('formats teacher message', () => {
    expect(
      telegramTeacherMessage({
        displayName: 'S',
        teacherName: 'T',
        body: 'Hi there',
        appUrl: 'https://app.test',
      }),
    ).toContain('Message from');
  });
});
