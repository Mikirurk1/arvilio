'use client';

import { FormEvent, useCallback, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { apiClient } from '../../../lib/api';
import { track } from '../../../lib/analytics';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import styles from '../auth.module.scss';

const SITE_KEY = process.env['NEXT_PUBLIC_TURNSTILE_SITE_KEY'] ?? '';

declare global {
  interface Window {
    turnstile?: {
      reset: (widgetId: string) => void;
    };
    _turnstileCallback?: (token: string) => void;
  }
}

/**
 * Self-serve "create your school" signup (Phase 4.5.1, G19/G28). No card; starts a
 * 7-day trial and auto-logs the new admin in. After success we hard-navigate so the
 * SSR layer picks up the freshly set session cookies.
 * G37: Cloudflare Turnstile widget added when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 */
export default function SignupPage() {
  const [schoolName, setSchoolName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const widgetRef = useRef<string | null>(null);

  const onCaptchaVerified = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  // Register global callback before the script runs.
  if (typeof window !== 'undefined') {
    window._turnstileCallback = onCaptchaVerified;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (SITE_KEY && !captchaToken) {
      setFormError('Please complete the security check.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      track({ name: 'signup_started' });
      const res = await apiClient.post<{ schoolId?: string }>('/auth/register-school', {
        schoolName,
        displayName: displayName || undefined,
        email,
        password,
        captchaToken: captchaToken ?? undefined,
      });
      track({ name: 'signup_completed', schoolId: res?.schoolId ?? '' });
      window.location.href = '/onboarding';
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign up failed');
      setSubmitting(false);
      // Reset widget so the user can try again.
      if (widgetRef.current && window.turnstile) {
        window.turnstile.reset(widgetRef.current);
      }
      setCaptchaToken(null);
    }
  };

  return (
    <div className={styles.shell}>
      {SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      ) : null}

      <div className={styles.card}>
        <div className={styles.brand}>
          <BrandLogo size="lg" href={null} className={styles.brandLogo} />
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Create your school</h1>
          <p className={styles.subtitle}>
            Start a free 7-day trial — no credit card required.
          </p>
        </div>

        {formError ? (
          <div className={styles.error} role="alert">
            {formError}
          </div>
        ) : null}

        <form className={styles.actions} onSubmit={onSubmit} noValidate>
          <Field
            id="signup-school"
            label="School name"
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
          />
          <Field
            id="signup-name"
            label="Your name"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <Field
            id="signup-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="signup-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {SITE_KEY ? (
            <div
              className="cf-turnstile"
              data-sitekey={SITE_KEY}
              data-callback="_turnstileCallback"
              ref={(el) => {
                // Capture the widget ID set by Turnstile on the element.
                if (el) widgetRef.current = el.getAttribute('data-widget-id');
              }}
            />
          ) : null}

          <Button
            variant="primary"
            className={styles.submitBtn}
            type="submit"
            loading={submitting}
            loadingLabel="Creating…"
            disabled={Boolean(SITE_KEY && !captchaToken)}
          >
            Create school
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.secondaryLink} href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
