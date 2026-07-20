import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';
import { brand, fontFamily } from '../styles';

type EmailLayoutProps = {
  preview?: string;
  children: ReactNode;
};

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: brand.background,
          fontFamily,
          color: brand.text,
        }}
      >
        <Container style={{ maxWidth: 520, margin: '32px auto', padding: '0 16px' }}>
          <Section
            style={{
              backgroundColor: brand.white,
              borderRadius: 12,
              border: `1px solid ${brand.border}`,
              overflow: 'hidden',
              padding: '28px',
            }}
          >
            <Text
              style={{
                margin: '0 0 20px',
                fontSize: 22,
                fontWeight: 700,
                color: brand.blue,
              }}
            >
              Arvilio
            </Text>
            {children}
            <Text
              style={{
                margin: '24px 0 0',
                fontSize: 13,
                lineHeight: '20px',
                color: brand.faint,
              }}
            >
              — Arvilio
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
