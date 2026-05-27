'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import styles from '../auth.module.scss';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  no_account: 'No account exists for that Google email. Ask an administrator to create one.',
  account_paused: 'Your account is paused. Contact your administrator to reactivate it.',
  account_leaved:
    'Your account is no longer active at this school. Contact your administrator if this is a mistake.',
  account_blocked: 'Your account is blocked. Contact support or your administrator.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleSignInUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const next = searchParams.get('next') ?? '/dashboard';
  const accountError = searchParams.get('error');
  const resetStatus = searchParams.get('reset');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await login({ email, password });
      router.replace(next);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <BrandLogo size="lg" className={styles.brandLogo} />
        </div>
        <div>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Welcome back! Continue your English journey.</p>
        </div>
        {formError ? <div className={styles.error}>{formError}</div> : null}
        {accountError && LOGIN_ERROR_MESSAGES[accountError] ? (
          <div className={styles.error}>{LOGIN_ERROR_MESSAGES[accountError]}</div>
        ) : null}
        {resetStatus === 'success' ? (
          <div className={styles.success}>
            Password updated. You can now sign in with your new password.
          </div>
        ) : null}
        <Link className={styles.googleBtn} href={googleSignInUrl}>
          <GoogleIcon />
          Continue with Google
        </Link>
        <div className={styles.divider}>or</div>
        <form className={styles.actions} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="login-email">Email</label>
            <Field
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password">Password</label>
            <Field
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className={styles.linkRow}>
            <button
              type="button"
              className={styles.secondaryLinkButton}
              onClick={() => router.push('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>
          <Button className={styles.primary} type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className={styles.footer}>Need an account? Contact your administrator.</p>
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
