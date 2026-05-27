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
          <BrandLogo size="lg" className={styles.brandLogo} />
        </div>
        <div>
          <h1 className={styles.title}>Forgot password</h1>
          <p className={styles.subtitle}>
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
        {success ? (
          <div className={styles.success}>
            If an account with that email exists, a reset link has been sent.
          </div>
        ) : null}
        <form className={styles.actions} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="forgot-password-email">Email</label>
            <Field
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button className={styles.primary} type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        <p className={styles.helperText}>
          The link expires automatically. If you use Google sign-in only, contact your
          administrator instead.
        </p>
        <p className={styles.footer}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
