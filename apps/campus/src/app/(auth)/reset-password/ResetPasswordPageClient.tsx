'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { ResetPasswordRequestDto } from '@pkg/types';
import { withLocalePrefix } from '@pkg/types';
import Image from 'next/image';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { apiClient } from '../../../lib/api';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
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
  const t = useCampusT();
  const { locale } = useCampusI18n();
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
      setError(t('reset.error.missingToken'));
      return;
    }
    if (newPassword.length < 8) {
      setError(t('reset.error.minLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('reset.error.mismatch'));
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post<{ ok: true }>('/auth/reset-password', {
        token,
        newPassword,
      } satisfies ResetPasswordRequestDto);
      router.replace(`${withLocalePrefix('/login', locale)}?reset=success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reset.error.failed'));
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
              alt={t('login.logoAlt')}
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
          <h1 className={styles.title}>{t('reset.title')}</h1>
          <p className={styles.subtitle}>
            {missingToken ? t('reset.missingTokenSubtitle') : t('reset.subtitle')}
          </p>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        {missingToken ? (
          <div className={styles.info} role="status">
            <p className={styles.infoBody}>{t('reset.missingTokenBody')}</p>
            <Link className={styles.infoAction} href={withLocalePrefix('/forgot-password', locale)}>
              {t('reset.requestNewLink')}
            </Link>
          </div>
        ) : (
          <form className={styles.actions} onSubmit={onSubmit} noValidate>
            <Field
              id="reset-password-new"
              label={t('reset.password')}
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              passwordToggleShowLabel={t('login.showPassword')}
              passwordToggleHideLabel={t('login.hidePassword')}
            />
            <Field
              id="reset-password-confirm"
              label={t('reset.confirm')}
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              passwordToggleShowLabel={t('login.showPassword')}
              passwordToggleHideLabel={t('login.hidePassword')}
            />
            <Button
              variant="primary"
              className={styles.submitBtn}
              type="submit"
              loading={submitting}
              loadingLabel={t('reset.updating')}
            >
              {t('reset.submit')}
            </Button>
          </form>
        )}

        <p className={styles.footer}>
          <Link className={styles.footerLink} href={withLocalePrefix('/login', locale)}>
            {t('reset.back')}
          </Link>
        </p>
      </div>
    </div>
  );
}
