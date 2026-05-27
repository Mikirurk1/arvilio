import { Button, Heading, Link, Text } from '@react-email/components';
import { DetailBox } from '../components/detail-box';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { PasswordResetEmailProps } from '../types';

export function PasswordResetEmail({
  displayName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your SoEnglish password">
      <Heading
        as="h1"
        style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: brand.text }}
      >
        Reset your password
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName}, we received a request to reset your SoEnglish password.
      </Text>
      <DetailBox>
        <Text style={{ margin: '0 0 12px', fontSize: 14, lineHeight: '21px', color: brand.text }}>
          Use the button below to choose a new password. This link expires in {expiresInMinutes}
          {' '}minutes.
        </Text>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: brand.blue,
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Reset password
        </Button>
        <Text style={{ margin: '14px 0 0', fontSize: 13, lineHeight: '19px', color: brand.faint }}>
          If the button does not work, open this link:
          <br />
          <Link href={resetUrl} style={{ color: brand.blue }}>
            {resetUrl}
          </Link>
        </Text>
      </DetailBox>
      <Text style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: brand.faint }}>
        If you did not request a password reset, you can ignore this email. Your current password
        will keep working until you set a new one.
      </Text>
    </EmailLayout>
  );
}
