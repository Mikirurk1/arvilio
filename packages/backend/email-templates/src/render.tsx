import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { LessonReminderEmail } from './templates/lesson-reminder';
import { NewVocabularyEmail } from './templates/new-vocabulary';
import { PasswordResetEmail } from './templates/password-reset';
import { StreakAlertEmail } from './templates/streak-alert';
import { TeacherMessageEmail } from './templates/teacher-message';
import { WeeklyReportEmail } from './templates/weekly-report';
import { WelcomeAccountEmail } from './templates/welcome-account';
import type {
  EmailTemplateId,
  EmailTemplatePropsMap,
  RenderedEmail,
} from './types';

function subjectFor<T extends EmailTemplateId>(
  templateId: T,
  props: EmailTemplatePropsMap[T],
): string {
  switch (templateId) {
    case 'welcome-account':
      return 'Welcome to SoEnglish';
    case 'password-reset':
      return 'Reset your SoEnglish password';
    case 'lesson-reminder':
      return `Reminder: ${(props as EmailTemplatePropsMap['lesson-reminder']).lessonTitle} starts in 30 minutes`;
    case 'streak-alert':
      return 'Keep your learning streak alive';
    case 'weekly-report':
      return 'Your weekly SoEnglish report';
    case 'new-vocabulary':
      return `Word of the day: ${(props as EmailTemplatePropsMap['new-vocabulary']).word}`;
    case 'teacher-message':
      return `Message from ${(props as EmailTemplatePropsMap['teacher-message']).teacherName}`;
    default:
      return 'SoEnglish';
  }
}

function elementFor<T extends EmailTemplateId>(
  templateId: T,
  props: EmailTemplatePropsMap[T],
): ReactElement {
  switch (templateId) {
    case 'welcome-account':
      return <WelcomeAccountEmail {...(props as EmailTemplatePropsMap['welcome-account'])} />;
    case 'password-reset':
      return <PasswordResetEmail {...(props as EmailTemplatePropsMap['password-reset'])} />;
    case 'lesson-reminder':
      return <LessonReminderEmail {...(props as EmailTemplatePropsMap['lesson-reminder'])} />;
    case 'streak-alert':
      return <StreakAlertEmail {...(props as EmailTemplatePropsMap['streak-alert'])} />;
    case 'weekly-report':
      return <WeeklyReportEmail {...(props as EmailTemplatePropsMap['weekly-report'])} />;
    case 'new-vocabulary':
      return <NewVocabularyEmail {...(props as EmailTemplatePropsMap['new-vocabulary'])} />;
    case 'teacher-message':
      return <TeacherMessageEmail {...(props as EmailTemplatePropsMap['teacher-message'])} />;
    default: {
      const _exhaustive: never = templateId;
      throw new Error(`Unknown email template: ${_exhaustive}`);
    }
  }
}

export async function renderEmail<T extends EmailTemplateId>(
  templateId: T,
  props: EmailTemplatePropsMap[T],
): Promise<RenderedEmail> {
  const element = elementFor(templateId, props);
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return {
    subject: subjectFor(templateId, props),
    html,
    text,
  };
}

/** @deprecated Use typed props via renderEmail */
export async function renderEmailFromVars(
  templateId: EmailTemplateId,
  vars: Record<string, string>,
): Promise<RenderedEmail> {
  return renderEmail(templateId, vars as EmailTemplatePropsMap[typeof templateId]);
}
