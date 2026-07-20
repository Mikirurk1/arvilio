'use client';

import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui';
import { TelegramConnectButton } from '../../components/profile/TelegramConnectButton';
import { useCampusT } from '../../lib/cms';
import { FACEBOOK_LINK_URL, GOOGLE_LINK_URL, ZOOM_LINK_URL } from '../../lib/api';
import type { ProfileLinkedAccountDto } from '@pkg/types';
import type { LinkedAccountLink } from '../../lib/linked-accounts';
import { ProfileTabPanel } from './panels';
import styles from './page.module.scss';

function providerTitle(provider: LinkedAccountLink['provider']): string {
  if (provider === 'google') return 'Google';
  if (provider === 'facebook') return 'Facebook';
  if (provider === 'zoom') return 'Zoom';
  return 'Telegram';
}

export function profileLinksToPanel(
  rows: ProfileLinkedAccountDto[] | undefined,
  fallback: LinkedAccountLink[],
): LinkedAccountLink[] {
  if (!rows?.length) return fallback;
  return rows.map((row) => ({
    provider: row.provider,
    linked: row.linked,
    connectedAs: row.connectedAs ?? undefined,
    calendarConnected: row.calendarConnected,
  }));
}

export function LinkedAccountsPanel({
  links,
  canLink = false,
  accountEmail,
  onConnectionChange,
}: {
  links: LinkedAccountLink[];
  canLink?: boolean;
  accountEmail?: string;
  onConnectionChange?: () => void;
}) {
  const t = useCampusT();
  const emailSuffix = accountEmail ? ` (${accountEmail})` : '';

  return (
    <ProfileTabPanel data-tour-anchor="profile-connections">
      <h2 className={styles.sectionTitle}>{t('profile.connections.title')}</h2>
      <p className={styles.linkedIntro}>
        {t('profile.connections.intro', { emailSuffix })}
      </p>
      {links.map((link) => {
        const isGoogle = link.provider === 'google';
        const isFacebook = link.provider === 'facebook';
        const isTelegram = link.provider === 'telegram';
        const isZoom = link.provider === 'zoom';
        const calendarReady = isGoogle && link.calendarConnected;
        return (
          <div key={link.provider} className={styles.linkedRow}>
            <div className={styles.linkedInfo}>
              <div className={styles.linkedTitleRow}>
                <span className={styles.linkedProviderMark} data-provider={link.provider} aria-hidden>
                  {link.provider.charAt(0).toUpperCase()}
                </span>
                <div className={styles.linkedTitle}>{providerTitle(link.provider)}</div>
                {link.linked ? (
                  <span className={styles.linkedTrustBadge}><ShieldCheck size={12} aria-hidden />{t('profile.connections.verified')}</span>
                ) : null}
              </div>
              {link.linked && link.connectedAs ? (
                <div className={styles.linkedMeta}>{link.connectedAs}</div>
              ) : !link.linked ? (
                <div className={styles.linkedMeta}>{t('profile.connections.notConnected')}</div>
              ) : null}
              {isGoogle && link.linked && !calendarReady ? (
                <div className={styles.linkedMeta}>{t('profile.connections.calendarMissing')}</div>
              ) : null}
              {calendarReady ? <div className={styles.linkedMeta}>{t('profile.connections.calendarReady')}</div> : null}
            </div>
            <div className={styles.linkedRowActions}>
              {isGoogle && canLink ? (
                <Button type="button" className={styles.linkedConnectBtn} onClick={() => { window.location.href = GOOGLE_LINK_URL; }}>
                  {link.linked ? t('profile.connections.reconnectGoogle') : t('profile.connections.connectGoogle')}
                </Button>
              ) : null}
              {isFacebook && canLink ? (
                <Button type="button" className={styles.linkedConnectBtn} onClick={() => { window.location.href = FACEBOOK_LINK_URL; }}>
                  {link.linked ? t('profile.connections.reconnectFacebook') : t('profile.connections.connectFacebook')}
                </Button>
              ) : null}
              {isZoom && canLink ? (
                <Button type="button" className={styles.linkedConnectBtn} onClick={() => { window.location.href = ZOOM_LINK_URL; }}>
                  {link.linked ? t('profile.connections.reconnectZoom') : t('profile.connections.connectZoom')}
                </Button>
              ) : null}
              {isTelegram && canLink ? (
                link.linked ? (
                  <span className={`${styles.linkedBadge} ${styles.linkedBadgeOn}`}>{t('profile.connections.connected')}</span>
                ) : (
                  <TelegramConnectButton onLinked={onConnectionChange} />
                )
              ) : null}
              {!canLink ? (
                <span className={`${styles.linkedBadge} ${link.linked ? styles.linkedBadgeOn : styles.linkedBadgeOff}`}>
                  {link.linked ? t('profile.connections.connected') : t('profile.connections.disconnected')}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </ProfileTabPanel>
  );
}
