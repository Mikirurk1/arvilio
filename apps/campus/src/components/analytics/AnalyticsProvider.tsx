'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  identifyUser,
  initAnalytics,
  resetAnalytics,
  trackPageview,
} from '../../lib/analytics';
import { hasAnalyticsConsent } from '../../lib/cookie-consent';
import { CookieConsentBanner } from '../ui/CookieConsentBanner';

/** Initialize PostHog once and keep user identity in sync. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    if (hasAnalyticsConsent()) initAnalytics();
  }, []);

  const handleConsent = useCallback((accepted: boolean) => {
    if (accepted) initAnalytics();
  }, []);

  useEffect(() => {
    if (!user) {
      if (lastUserId.current) resetAnalytics();
      lastUserId.current = null;
      return;
    }
    if (user.id !== lastUserId.current) {
      identifyUser(user.id, user.schoolId ?? '', user.role?.toString() ?? '');
      lastUserId.current = user.id;
    }
  }, [user]);

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    trackPageview(url);
  }, [pathname, searchParams]);

  return (
    <>
      {children}
      <CookieConsentBanner onConsent={handleConsent} />
    </>
  );
}
