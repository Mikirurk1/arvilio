'use client';

import { ArviSlot } from '../components/mascot/ArviSlot';
import { Button } from '../components/ui';
import { useCampusT } from '../lib/cms';

export default function NotFound() {
  const t = useCampusT();
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <ArviSlot variant="inline" pose="encourage" size={96} eager />
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('notFound.title')}</h1>
      <p style={{ margin: 0, color: 'var(--text-secondary, #667)' }}>
        {t('notFound.body')}
      </p>
      <Button href="/dashboard" variant="primary">
        {t('notFound.back')}
      </Button>
    </main>
  );
}
