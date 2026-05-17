import { Heading, Link, Text } from '@react-email/components';
import { DetailBox } from '../components/detail-box';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { TeacherMessageEmailProps } from '../types';

export function TeacherMessageEmail({
  displayName,
  teacherName,
  body,
  appUrl,
}: TeacherMessageEmailProps) {
  return (
    <EmailLayout preview={`Message from ${teacherName}`}>
      <Text style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName},
      </Text>
      <Heading
        as="h1"
        style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600, color: brand.text }}
      >
        Message from {teacherName}
      </Heading>
      <DetailBox>
        <span style={{ whiteSpace: 'pre-wrap' }}>{body}</span>
      </DetailBox>
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
