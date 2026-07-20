'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsentChoice, setConsentChoice } from '../../lib/cookie-consent';
import { useCampusT } from '../../lib/cms';
import { Button } from './Button';
import styles from './CookieConsentBanner.module.scss';

interface Props {
  onConsent: (accepted: boolean) => void;
}

export function CookieConsentBanner({ onConsent }: Props) {
  const t = useCampusT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsentChoice() === null) setVisible(true);
  }, []);

  function accept() {
    setConsentChoice('accepted');
    setVisible(false);
    onConsent(true);
  }

  function decline() {
    setConsentChoice('declined');
    setVisible(false);
    onConsent(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label={t('cookie.aria')}>
      <p className={styles.text}>
        {t('cookie.body')}{' '}
        <Link href="/privacy" className={styles.link}>
          {t('cookie.privacyLink')}
        </Link>
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={decline}>
          {t('cookie.decline')}
        </Button>
        <Button variant="primary" onClick={accept}>
          {t('cookie.accept')}
        </Button>
      </div>
    </div>
  );
}
