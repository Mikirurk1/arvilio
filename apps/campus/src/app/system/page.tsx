'use client';

import { useMemo, useState } from 'react';
import { Mail, BookOpenText, CreditCard, ShieldCheck, Cpu, Link2, Settings2, Banknote, Globe, Palette, Scale, Sparkles } from 'lucide-react';
import { PageHeader, Tabs, type TabsItem } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import { EmailTestPanel } from './panels';
import { WordDictionaryPanel } from './WordDictionaryPanel';
import { ConnectionsPanel } from './connections/ConnectionsPanel';
import { PaymentsPanel } from './payment/PaymentsPanel';
import { PayoutsDefaultsPanel } from './payment/PayoutsDefaultsPanel';
import { GeneralPanel } from './GeneralPanel';
import { DomainsPanel } from './DomainsPanel';
import { BrandingPanel } from './BrandingPanel';
import { SellerLegalPanel } from './SellerLegalPanel';
import { LlmAssistantPanel } from './LlmAssistantPanel';
import styles from './page.module.scss';

type SystemTab =
  | 'general'
  | 'email'
  | 'dictionary'
  | 'ai'
  | 'connections'
  | 'payments'
  | 'payouts'
  | 'domains'
  | 'branding'
  | 'seller';

export default function SystemPage() {
  const t = useCampusT();
  const [tab, setTab] = useState<SystemTab>('general');

  const tabs = useMemo(
    (): TabsItem<SystemTab>[] => [
      {
        value: 'general',
        label: (
          <span className={styles.tabLabel}>
            <Settings2 size={14} aria-hidden />
            {t('system.tab.general')}
          </span>
        ),
        panel: <GeneralPanel onOpenConnections={() => setTab('connections')} />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-general' },
      },
      {
        value: 'email',
        label: (
          <span className={styles.tabLabel}>
            <Mail size={14} aria-hidden />
            {t('system.tab.email')}
          </span>
        ),
        panel: <EmailTestPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-email' },
      },
      {
        value: 'dictionary',
        label: (
          <span className={styles.tabLabel}>
            <BookOpenText size={14} aria-hidden />
            {t('system.tab.dictionary')}
          </span>
        ),
        panel: <WordDictionaryPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-dictionary' },
      },
      {
        value: 'ai',
        label: (
          <span className={styles.tabLabel}>
            <Sparkles size={14} aria-hidden />
            {t('system.tab.ai')}
          </span>
        ),
        panel: <LlmAssistantPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-ai' },
      },
      {
        value: 'connections',
        label: (
          <span className={styles.tabLabel}>
            <Link2 size={14} aria-hidden />
            {t('system.tab.connections')}
          </span>
        ),
        panel: <ConnectionsPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-connections' },
      },
      {
        value: 'payments',
        label: (
          <span className={styles.tabLabel}>
            <CreditCard size={14} aria-hidden />
            {t('system.tab.payments')}
          </span>
        ),
        panel: <PaymentsPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-payments-trigger' },
      },
      {
        value: 'payouts',
        label: (
          <span className={styles.tabLabel}>
            <Banknote size={14} aria-hidden />
            {t('system.tab.payouts')}
          </span>
        ),
        panel: <PayoutsDefaultsPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-payouts' },
      },
      {
        value: 'domains',
        label: (
          <span className={styles.tabLabel}>
            <Globe size={14} aria-hidden />
            {t('system.tab.domains')}
          </span>
        ),
        panel: <DomainsPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-domains' },
      },
      {
        value: 'branding',
        label: (
          <span className={styles.tabLabel}>
            <Palette size={14} aria-hidden />
            {t('system.tab.branding')}
          </span>
        ),
        panel: <BrandingPanel />,
        dataAttrs: { 'data-tour-anchor': 'system-tab-branding' },
      },
      {
        value: 'seller',
        label: (
          <span className={styles.tabLabel}>
            <Scale size={14} aria-hidden />
            {t('system.tab.seller')}
          </span>
        ),
        panel: <SellerLegalPanel />,
      },
    ],
    [t],
  );

  return (
    <div className={`${styles.page} container container--page`}>
      <PageHeader
        className={styles.pageHeader}
        titleClassName={styles.pageTitle}
        subtitleClassName={styles.pageSub}
        title={t('system.title')}
        subtitle={t('system.subtitle')}
      />
      <section className={styles.overviewGrid} aria-label={t('system.overview.aria')}>
        <article className={styles.overviewCard}>
          <span className={styles.overviewIcon} aria-hidden>
            <ShieldCheck size={16} />
          </span>
          <p className={styles.overviewTitle}>{t('system.overview.superAdmin.title')}</p>
          <p className={styles.overviewText}>{t('system.overview.superAdmin.text')}</p>
        </article>
        <article className={styles.overviewCard}>
          <span className={styles.overviewIcon} aria-hidden>
            <Cpu size={16} />
          </span>
          <p className={styles.overviewTitle}>{t('system.overview.diagnostics.title')}</p>
          <p className={styles.overviewText}>{t('system.overview.diagnostics.text')}</p>
        </article>
      </section>
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={tabs}
        ariaLabel={t('system.tabs.ariaLabel')}
        className={styles.card}
        listClassName={styles.tabsList}
        triggerClassName={styles.tabsTrigger}
        activeTriggerClassName={styles.tabsTriggerActive}
        panelClassName={styles.tabsPanel}
      />
    </div>
  );
}
