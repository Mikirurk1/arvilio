import { Heading, Link, Text } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { brand } from '../styles';
import type { NewVocabularyEmailProps } from '../types';

export function NewVocabularyEmail({
  displayName,
  word,
  definition,
  appUrl,
}: NewVocabularyEmailProps) {
  return (
    <EmailLayout preview={`Today's word: ${word}`}>
      <Text style={{ margin: '0 0 12px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        Hi {displayName},
      </Text>
      <Heading
        as="h1"
        style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: brand.text }}
      >
        Word of the day
      </Heading>
      <Text style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: brand.blue }}>
        {word}
      </Text>
      <Text style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '22px', color: brand.muted }}>
        {definition}
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
        Open vocabulary
      </Link>
    </EmailLayout>
  );
}
