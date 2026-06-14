'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import type { ForgotPasswordRequestDto } from '@pkg/types';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { apiClient } from '../../../lib/api';
import styles from '../auth.module.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.post<{ ok: true }>('/auth/forgot-password', {
        email,
      } satisfies ForgotPasswordRequestDto);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <BrandLogo size="lg" href={null} className={styles.brandLogo} />
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Forgot password?</h1>
          <p className={styles.subtitle}>
            No worries — enter your email and we&apos;ll send a secure link to choose a new
            password.
          </p>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className={styles.success} role="status">
            <strong className={styles.successTitle}>Check your inbox</strong>
            <p className={styles.successBody}>
              If an account exists for that address, you&apos;ll receive a reset link shortly. The
              link expires for your security.
            </p>
          </div>
        ) : null}

        {!success ? (
          <form className={styles.actions} onSubmit={onSubmit} noValidate>
            <Field
              id="forgot-password-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              variant="primary"
              className={styles.submitBtn}
              type="submit"
              loading={submitting}
              loadingLabel="Sending…"
            >
              Send reset link
            </Button>
          </form>
        ) : null}

        <p className={styles.helperText}>
          Sign in with Google only? You don&apos;t need a password — ask your administrator if you
          can&apos;t access your account.
        </p>

        <p className={styles.footer}>
          <Link className={styles.footerLink} href="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
