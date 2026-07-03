import { Button, Heading, Link, Text } from '@react-email/components';
import { DetailBox } from '../components/detail-box';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { SchoolInvitationEmailProps } from '../types';

export function SchoolInvitationEmail({
  schoolName,
  role,
  acceptUrl,
  expiresInDays,
}: SchoolInvitationEmailProps) {
  return (
    <EmailLayout preview={`You've been invited to join ${schoolName}`}>
      <Heading
        as="h1"
        style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: brand.text }}
      >
        You're invited to join {schoolName}
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        You've been invited to join <strong>{schoolName}</strong> as a{' '}
        <strong>{role}</strong>. Click the button below to accept the invitation.
      </Text>
      <DetailBox>
        <Text style={{ margin: '0 0 12px', fontSize: 14, lineHeight: '21px', color: brand.text }}>
          This invitation expires in {expiresInDays} days.
        </Text>
        <Button
          href={acceptUrl}
          style={{
            backgroundColor: brand.blue,
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Accept invitation
        </Button>
        <Text style={{ margin: '14px 0 0', fontSize: 13, lineHeight: '19px', color: brand.faint }}>
          If the button does not work, open this link:
          <br />
          <Link href={acceptUrl} style={{ color: brand.blue }}>
            {acceptUrl}
          </Link>
        </Text>
      </DetailBox>
      <Text style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: brand.faint }}>
        If you did not expect this invitation, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
