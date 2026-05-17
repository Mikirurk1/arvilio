'use client';

import { useMemo, useState } from 'react';
import { EmptyStateCard, PageHeader, Tabs, type TabsItem } from '../../components/ui';
import { useActiveRoleKey, isSuperAdminKey } from '../../lib/active-user';
import { EmailTestPanel } from './panels';
import { WordDictionaryPanel } from './WordDictionaryPanel';
import styles from './page.module.scss';

type SystemTab = 'email' | 'dictionary';

export default function SystemPage() {
  const roleKey = useActiveRoleKey();
  const canAccess = isSuperAdminKey(roleKey);
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
    ],
    [],
  );

  if (!canAccess) {
    return (
      <div className={`${styles.page} container container--page`}>
        <EmptyStateCard
          title="No permission"
          description="System tools are available only to super-admins."
        />
      </div>
    );
  }

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
