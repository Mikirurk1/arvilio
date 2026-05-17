import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { WeeklyReportEmailProps } from '../types';

export function WeeklyReportEmail({
  displayName,
  lessonsThisWeek,
  lessonsCompleted,
  vocabularyCount,
  reviewCount,
  appUrl,
}: WeeklyReportEmailProps) {
  const rows = [
    ['Lessons this week', lessonsThisWeek],
    ['Lessons completed (total)', lessonsCompleted],
    ['Vocabulary cards', vocabularyCount],
    ['Cards to review', reviewCount],
  ] as const;

  return (
    <EmailLayout preview="Your weekly learning summary">
      <Text style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName},
      </Text>
      <Heading
        as="h1"
        style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600, color: brand.text }}
      >
        Weekly report
      </Heading>
      {rows.map(([label, value]) => (
        <Text
          key={label}
          style={{ margin: '0 0 8px', fontSize: 15, lineHeight: '22px', color: brand.muted }}
        >
          {label}: <strong style={{ color: brand.text }}>{value}</strong>
        </Text>
      ))}
      <Link
        href={appUrl}
        style={{
          display: 'inline-block',
          marginTop: 8,
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
