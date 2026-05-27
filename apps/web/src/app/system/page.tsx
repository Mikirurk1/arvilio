'use client';

import { useMemo, useState } from 'react';
import { PageHeader, Tabs, type TabsItem } from '../../components/ui';
import { EmailTestPanel } from './panels';
import { WordDictionaryPanel } from './WordDictionaryPanel';
import { PaymentsPanel } from './PaymentsPanel';
import styles from './page.module.scss';

type SystemTab = 'email' | 'dictionary' | 'payments';

export default function SystemPage() {
  const [tab, setTab] = useState<SystemTab>('email');

  const tabs = useMemo(
    (): TabsItem<SystemTab>[] => [
      {
        value: 'email',
        label: 'Email',
        panel: <EmailTestPanel />,
      },
      {
        value: 'dictionary',
        label: 'Word dictionary',
        panel: <WordDictionaryPanel />,
      },
      {
        value: 'payments',
        label: 'Payments',
        panel: <PaymentsPanel />,
      },
    ],
    [],
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title="System"
        subtitle="Platform configuration and diagnostics. Super-admin only."
      />
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={tabs}
        ariaLabel="System sections"
        className={styles.card}
      />
    </div>
  );
}
