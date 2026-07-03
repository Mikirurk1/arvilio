'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsentChoice, setConsentChoice } from '../../lib/cookie-consent';
import { Button } from './Button';
import styles from './CookieConsentBanner.module.scss';

interface Props {
  onConsent: (accepted: boolean) => void;
}

export function CookieConsentBanner({ onConsent }: Props) {
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
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use analytics cookies to improve the product.{' '}
        <Link href="/privacy" className={styles.link}>
          Privacy policy
        </Link>
      </p>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={decline}>
          Decline
        </Button>
        <Button variant="primary" onClick={accept}>
          Accept
        </Button>
      </div>
    </div>
  );
}
