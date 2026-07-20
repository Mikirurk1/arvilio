import { Heading, Link, Text } from '@react-email/components';
import { DetailBox } from '../components/detail-box';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { WelcomeAccountEmailProps } from '../types';

export function WelcomeAccountEmail({
  displayName,
  email,
  password,
  loginUrl,
}: WelcomeAccountEmailProps) {
  return (
    <EmailLayout preview={`Welcome to Arvilio, ${displayName}`}>
      <Heading
        as="h1"
        style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: brand.text }}
      >
        Welcome, {displayName}!
      </Heading>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Your administrator created an account for you on the Arvilio platform.
      </Text>
      <DetailBox>
        <strong style={{ color: brand.text }}>Sign in</strong>
        <br />
        <Link href={loginUrl} style={{ color: brand.blue }}>
          {loginUrl}
        </Link>
        <br />
        <br />
        <strong style={{ color: brand.text }}>Email</strong>
        <br />
        {email}
        <br />
        <br />
        <strong style={{ color: brand.text }}>Temporary password</strong>
        <br />
        <code
          style={{
            fontSize: 15,
            backgroundColor: brand.white,
            padding: '4px 8px',
            borderRadius: 4,
            border: `1px solid ${brand.border}`,
          }}
        >
          {password}
        </code>
      </DetailBox>
      <Text style={{ margin: 0, fontSize: 13, lineHeight: '20px', color: brand.faint }}>
        After your first sign-in, change your password under <strong>Profile → Account</strong>.
        If you did not expect this email, contact your administrator.
      </Text>
    </EmailLayout>
  );
}
