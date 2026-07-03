export type EmailTemplateId =
  | 'welcome-account'
  | 'password-reset'
  | 'email-verification'
  | 'lesson-reminder'
  | 'streak-alert'
  | 'weekly-report'
  | 'new-vocabulary'
  | 'teacher-message'
  | 'school-invitation';

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

export type PasswordResetEmailProps = {
  displayName: string;
  resetUrl: string;
  expiresInMinutes: string;
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

export type SchoolInvitationEmailProps = {
  schoolName: string;
  role: string;
  acceptUrl: string;
  expiresInDays: string;
};

export type EmailVerificationEmailProps = {
  displayName: string;
  verifyUrl: string;
  expiresInHours: string;
};

export type EmailTemplatePropsMap = {
  'welcome-account': WelcomeAccountEmailProps;
  'password-reset': PasswordResetEmailProps;
  'email-verification': EmailVerificationEmailProps;
  'lesson-reminder': LessonReminderEmailProps;
  'streak-alert': StreakAlertEmailProps;
  'weekly-report': WeeklyReportEmailProps;
  'new-vocabulary': NewVocabularyEmailProps;
  'teacher-message': TeacherMessageEmailProps;
  'school-invitation': SchoolInvitationEmailProps;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};
