'use client';

import { useMemo, useState } from 'react';
import { Mail, BookOpenText, CreditCard, ShieldCheck, Cpu, Link2, Settings2, Banknote, Globe, Palette } from 'lucide-react';
import { PageHeader, Tabs, type TabsItem } from '../../components/ui';
import { EmailTestPanel } from './panels';
import { WordDictionaryPanel } from './WordDictionaryPanel';
import { ConnectionsPanel } from './connections/ConnectionsPanel';
import { PaymentsPanel } from './payment/PaymentsPanel';
import { PayoutsDefaultsPanel } from './payment/PayoutsDefaultsPanel';
import { GeneralPanel } from './GeneralPanel';
import { DomainsPanel } from './DomainsPanel';
import { BrandingPanel } from './BrandingPanel';
import styles from './page.module.scss';

type SystemTab = 'general' | 'email' | 'dictionary' | 'connections' | 'payments' | 'payouts' | 'domains' | 'branding';

export default function SystemPage() {
  const [tab, setTab] = useState<SystemTab>('general');

  const tabs = useMemo(
    (): TabsItem<SystemTab>[] => [
      {
        value: 'general',
        label: (
          <span className={styles.tabLabel}>
            <Settings2 size={14} aria-hidden />
            General
          </span>
        ),
        panel: <GeneralPanel onOpenConnections={() => setTab('connections')} />,
      },
      {
        value: 'email',
        label: (
          <span className={styles.tabLabel}>
            <Mail size={14} aria-hidden />
            Email
          </span>
        ),
        panel: <EmailTestPanel />,
      },
      {
        value: 'dictionary',
        label: (
          <span className={styles.tabLabel}>
            <BookOpenText size={14} aria-hidden />
            Word dictionary
          </span>
        ),
        panel: <WordDictionaryPanel />,
      },
      {
        value: 'connections',
        label: (
          <span className={styles.tabLabel}>
            <Link2 size={14} aria-hidden />
            Connections
          </span>
        ),
        panel: <ConnectionsPanel />,
      },
      {
        value: 'payments',
        label: (
          <span className={styles.tabLabel}>
            <CreditCard size={14} aria-hidden />
            Payments
          </span>
        ),
        panel: <PaymentsPanel />,
      },
      {
        value: 'payouts',
        label: (
          <span className={styles.tabLabel}>
            <Banknote size={14} aria-hidden />
            Payouts
          </span>
        ),
        panel: <PayoutsDefaultsPanel />,
      },
      {
        value: 'domains',
        label: (
          <span className={styles.tabLabel}>
            <Globe size={14} aria-hidden />
            Domains
          </span>
        ),
        panel: <DomainsPanel />,
      },
      {
        value: 'branding',
        label: (
          <span className={styles.tabLabel}>
            <Palette size={14} aria-hidden />
            Branding
          </span>
        ),
        panel: <BrandingPanel />,
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
        title="System control room"
        subtitle="General school settings, email, dictionary, translation, OAuth connections, payment infrastructure, and staff payout defaults."
      />
      <section className={styles.overviewGrid} aria-label="System overview">
        <article className={styles.overviewCard}>
          <span className={styles.overviewIcon} aria-hidden>
            <ShieldCheck size={16} />
          </span>
          <p className={styles.overviewTitle}>Super-admin scope</p>
          <p className={styles.overviewText}>
            Changes here affect the whole school workspace. Use controlled updates and verify each section after saving.
          </p>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.overviewIcon} aria-hidden>
            <Cpu size={16} />
          </span>
          <p className={styles.overviewTitle}>Diagnostics first</p>
          <p className={styles.overviewText}>
            Start with Email test and Dictionary checks before editing payment providers to reduce integration drift.
          </p>
        </article>
      </section>
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={tabs}
        ariaLabel="System sections"
        className={styles.card}
        listClassName={styles.tabsList}
        triggerClassName={styles.tabsTrigger}
        activeTriggerClassName={styles.tabsTriggerActive}
        panelClassName={styles.tabsPanel}
      />
    </div>
  );
}
