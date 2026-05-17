import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { LessonReminderEmailProps } from '../types';

export function LessonReminderEmail({
  displayName,
  lessonTitle,
  lessonDate,
  startTime,
  timezone,
  meetUrl,
}: LessonReminderEmailProps) {
  return (
    <EmailLayout preview={`${lessonTitle} starts in 30 minutes`}>
      <Text style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName},
      </Text>
      <Heading
        as="h1"
        style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: brand.text }}
      >
        Lesson reminder
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Your lesson <strong style={{ color: brand.text }}>{lessonTitle}</strong> starts at{' '}
        <strong style={{ color: brand.text }}>{startTime}</strong> on {lessonDate} ({timezone}).
      </Text>
      {meetUrl ? (
        <Link
          href={meetUrl}
          style={{
            display: 'inline-block',
            backgroundColor: brand.blue,
            color: brand.white,
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Join Google Meet
        </Link>
      ) : null}
    </EmailLayout>
  );
}
