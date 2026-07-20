'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ResetPasswordRequestDto } from '@pkg/types';
import Image from 'next/image';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { apiClient } from '../../../lib/api';
import { AuthCardFallback } from '../auth-loading';
import { useSchoolBranding } from '../../../lib/use-school-branding';
import styles from '../auth.module.scss';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCardFallback />}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const branding = useSchoolBranding();
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

  const missingToken = !token;

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          {branding?.logoUrl ? (
            <Image
              src={branding.logoUrl}
              alt="School logo"
              width={160}
              height={40}
              style={{ objectFit: 'contain', maxHeight: 40 }}
              unoptimized
            />
          ) : (
            <BrandLogo size="lg" href={null} className={styles.brandLogo} />
          )}
        </div>

        <div className={styles.intro}>
          <h1 className={styles.title}>Set a new password</h1>
          <p className={styles.subtitle}>
            {missingToken
              ? 'This reset link is incomplete. Request a fresh one below.'
              : 'Choose a strong password you have not used here before.'}
          </p>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        {missingToken ? (
          <div className={styles.info} role="status">
            <p className={styles.infoBody}>
              Open the full link from your email, or request a new reset from the sign-in page.
            </p>
            <Link className={styles.infoAction} href="/forgot-password">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form className={styles.actions} onSubmit={onSubmit} noValidate>
            <Field
              id="reset-password-new"
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Field
              id="reset-password-confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <Button
              variant="primary"
              className={styles.submitBtn}
              type="submit"
              loading={submitting}
              loadingLabel="Updating…"
            >
              Update password
            </Button>
          </form>
        )}

        <p className={styles.footer}>
          <Link className={styles.footerLink} href="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
