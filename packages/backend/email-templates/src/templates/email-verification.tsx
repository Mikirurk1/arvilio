import { Button, Heading, Link, Text } from '@react-email/components';
import { DetailBox } from '../components/detail-box';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { EmailVerificationEmailProps } from '../types';

export function EmailVerificationEmail({
  displayName,
  verifyUrl,
  expiresInHours,
}: EmailVerificationEmailProps) {
  return (
    <EmailLayout preview="Confirm your SoEnglish email address">
      <Heading
        as="h1"
        style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: brand.text }}
      >
        Confirm your email address
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName}, please confirm your email address to activate your SoEnglish school.
      </Text>
      <DetailBox>
        <Text style={{ margin: '0 0 12px', fontSize: 14, lineHeight: '21px', color: brand.text }}>
          Click the button below to verify your email. This link expires in {expiresInHours} hours.
        </Text>
        <Button
          href={verifyUrl}
          style={{
            backgroundColor: brand.blue,
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Confirm email
        </Button>
        <Text style={{ margin: '14px 0 0', fontSize: 13, lineHeight: '19px', color: brand.faint }}>
          If the button does not work, open this link:
          <br />
          <Link href={verifyUrl} style={{ color: brand.blue }}>
            {verifyUrl}
          </Link>
        </Text>
      </DetailBox>
      <Text style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: brand.faint }}>
        If you did not create a SoEnglish account, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
