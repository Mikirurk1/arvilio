'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ResetPasswordRequestDto } from '@pkg/types';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { apiClient } from '../../../lib/api';
import styles from '../auth.module.scss';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!token) {
      setError('Password reset link is missing or invalid.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post<{ ok: true }>('/auth/reset-password', {
        token,
        newPassword,
      } satisfies ResetPasswordRequestDto);
      router.replace('/login?reset=success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
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
          <h1 className={styles.title}>Set new password</h1>
          <p className={styles.subtitle}>Choose a new password for your SoEnglish account.</p>
        </div>
        {error ? <div className={styles.error}>{error}</div> : null}
        {!token ? (
          <>
            <p className={styles.helperText}>
              This password reset link is missing a token. Request a new one from the sign-in page.
            </p>
            <p className={styles.footer}>
              <Link href="/forgot-password">Request a new reset link</Link>
            </p>
          </>
        ) : (
          <>
            <form className={styles.actions} onSubmit={onSubmit}>
              <div className={styles.field}>
                <label htmlFor="reset-password-new">New password</label>
                <Field
                  id="reset-password-new"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="reset-password-confirm">Confirm new password</label>
                <Field
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              <Button className={styles.primary} type="submit" disabled={submitting}>
                {submitting ? 'Updating…' : 'Update password'}
              </Button>
            </form>
            <p className={styles.footer}>
              <Link href="/login">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
