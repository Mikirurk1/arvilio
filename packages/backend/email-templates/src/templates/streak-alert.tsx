import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { StreakAlertEmailProps } from '../types';

export function StreakAlertEmail({ displayName, streakDays, appUrl }: StreakAlertEmailProps) {
  return (
    <EmailLayout preview="Keep your learning streak alive">
      <Text style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName},
      </Text>
      <Heading
        as="h1"
        style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: brand.text }}
      >
        Don&apos;t lose your streak
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        You are on a <strong style={{ color: brand.text }}>{streakDays}-day</strong> learning
        streak. Practice today to keep it alive!
      </Text>
      <Link
        href={appUrl}
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
        Open SoEnglish
      </Link>
    </EmailLayout>
  );
}
