export type EmailTemplateId =
  | 'welcome-account'
  | 'lesson-reminder'
  | 'streak-alert'
  | 'weekly-report'
  | 'new-vocabulary'
  | 'teacher-message';

export type WelcomeAccountEmailProps = {
  displayName: string;
  email: string;
  password: string;
  loginUrl: string;
};

export type LessonReminderEmailProps = {
  displayName: string;
  lessonTitle: string;
  lessonDate: string;
  startTime: string;
  timezone: string;
  meetUrl: string;
};

export type StreakAlertEmailProps = {
  displayName: string;
  streakDays: string;
  appUrl: string;
};

export type WeeklyReportEmailProps = {
  displayName: string;
  lessonsThisWeek: string;
  lessonsCompleted: string;
  vocabularyCount: string;
  reviewCount: string;
  appUrl: string;
};

export type NewVocabularyEmailProps = {
  displayName: string;
  word: string;
  definition: string;
  appUrl: string;
};

export type TeacherMessageEmailProps = {
  displayName: string;
  teacherName: string;
  body: string;
  appUrl: string;
};

export type EmailTemplatePropsMap = {
  'welcome-account': WelcomeAccountEmailProps;
  'lesson-reminder': LessonReminderEmailProps;
  'streak-alert': StreakAlertEmailProps;
  'weekly-report': WeeklyReportEmailProps;
  'new-vocabulary': NewVocabularyEmailProps;
  'teacher-message': TeacherMessageEmailProps;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};
