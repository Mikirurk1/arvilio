'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../lib/auth-context';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
import { withLocalePrefix } from '@pkg/types';
import { useSchoolBranding } from '../../../lib/use-school-branding';
import { AuthCardFallback } from '../auth-loading';
import styles from '../auth.module.scss';

const LOGIN_ERROR_KEYS: Record<string, string> = {
  no_account: 'login.error.no_account',
  account_paused: 'login.error.account_paused',
  account_leaved: 'login.error.account_leaved',
  account_blocked: 'login.error.account_blocked',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthCardFallback />}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branding = useSchoolBranding();
  const { login, googleSignInUrl } = useAuth();
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const next = searchParams.get('next') ?? '/dashboard';
  const accountError = searchParams.get('error');
  const resetStatus = searchParams.get('reset');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setFormError(t('login.error.emailRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError(t('login.error.emailInvalid'));
      return;
    }
    if (!password) {
      setFormError(t('login.error.passwordRequired'));
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await login({ email, password });
      router.replace(next);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('login.error.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const accountErrorKey = accountError ? LOGIN_ERROR_KEYS[accountError] : undefined;

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          {branding?.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt={t('login.logoAlt')}
              width={160}
              height={40}
              priority
              style={{ objectFit: 'contain', maxHeight: 40 }}
              unoptimized
            />
          ) : (
            <BrandLogo size="lg" href={null} className={styles.brandLogo} />
          )}
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>{t('login.title')}</h1>
          <p className={styles.subtitle}>{t('login.subtitle')}</p>
        </div>

        {resetStatus === 'success' ? (
          <div className={styles.success}>{t('login.resetSuccess')}</div>
        ) : null}

        {/* Plain <a>: /api/auth/google is a Nest OAuth redirect (rewritten), not an App Router
            page — Next <Link> tries RSC fetch and logs "Failed to fetch RSC payload". */}
        <a className={styles.googleBtn} href={googleSignInUrl}>
          <GoogleIcon />
          {t('login.google')}
        </a>

        <div className={styles.divider}>{t('login.or')}</div>

        {formError ? (
          <div className={styles.error} role="alert">
            {formError}
          </div>
        ) : null}
        {accountErrorKey ? (
          <div className={styles.error} role="alert">
            {t(accountErrorKey)}
          </div>
        ) : null}

        <form className={styles.actions} onSubmit={onSubmit} noValidate>
          <Field
            id="login-email"
            label={t('login.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="login-password"
            label={t('login.password')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            passwordToggleShowLabel={t('login.showPassword')}
            passwordToggleHideLabel={t('login.hidePassword')}
          />
          <div className={styles.linkRow}>
            <Link className={styles.secondaryLink} href={withLocalePrefix('/forgot-password', locale)}>
              {t('login.forgot')}
            </Link>
          </div>
          <Button
            variant="primary"
            className={styles.submitBtn}
            type="submit"
            loading={submitting}
            loadingLabel={t('login.submitting')}
          >
            {t('login.submit')}
          </Button>
        </form>

        <p className={styles.footer}>
          {t('login.footer')}{' '}
          <span className={styles.footerMuted}>{t('login.footerHint')}</span>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21.6 12.227c0-.708-.064-1.39-.182-2.045H12v3.868h5.388a4.605 4.605 0 01-1.997 3.022v2.51h3.232c1.891-1.74 2.977-4.305 2.977-7.355z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.964-.895 6.618-2.418l-3.232-2.51c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H3.064v2.59A9.996 9.996 0 0012 22z"
        fill="#34A853"
      />
      <path
        d="M6.405 13.904a6.005 6.005 0 010-3.808V7.506H3.064a9.997 9.997 0 000 8.988l3.341-2.59z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.967c1.468 0 2.787.504 3.823 1.495l2.868-2.868C16.96 2.95 14.695 2 12 2A9.996 9.996 0 003.064 7.506l3.341 2.59C7.19 7.727 9.395 5.967 12 5.967z"
        fill="#EA4335"
      />
    </svg>
  );
}
