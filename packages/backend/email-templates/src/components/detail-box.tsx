import { Section, Text } from '@react-email/components';
import type { ReactNode } from 'react';
import { brand } from '../styles';

export function DetailBox({ children }: { children: ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: brand.surface,
        borderRadius: 8,
        border: `1px solid ${brand.border}`,
        padding: '16px 18px',
        margin: '16px 0',
      }}
    >
      <Text style={{ margin: 0, fontSize: 14, lineHeight: '22px', color: brand.muted }}>
        {children}
      </Text>
    </Section>
  );
}
