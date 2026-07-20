'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import type { ForgotPasswordRequestDto } from '@pkg/types';
import { withLocalePrefix } from '@pkg/types';
import Image from 'next/image';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { Button, Field } from '../../../components/ui';
import { apiClient } from '../../../lib/api';
import { useCampusI18n, useCampusT } from '../../../lib/cms';
import { useSchoolBranding } from '../../../lib/use-school-branding';
import styles from '../auth.module.scss';

export default function ForgotPasswordPage() {
  const t = useCampusT();
  const { locale } = useCampusI18n();
  const branding = useSchoolBranding();
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
      setError(err instanceof Error ? err.message : t('forgot.error.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className={styles.title}>{t('forgot.title')}</h1>
          <p className={styles.subtitle}>{t('forgot.subtitle')}</p>
        </div>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className={styles.success} role="status">
            <strong className={styles.successTitle}>{t('forgot.successTitle')}</strong>
            <p className={styles.successBody}>{t('forgot.successBody')}</p>
          </div>
        ) : null}

        {!success ? (
          <form className={styles.actions} onSubmit={onSubmit} noValidate>
            <Field
              id="forgot-password-email"
              label={t('login.email')}
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
              loadingLabel={t('forgot.sending')}
            >
              {t('forgot.submit')}
            </Button>
          </form>
        ) : null}

        <p className={styles.helperText}>{t('forgot.googleOnly')}</p>

        <p className={styles.footer}>
          <Link className={styles.footerLink} href={withLocalePrefix('/login', locale)}>
            {t('forgot.back')}
          </Link>
        </p>
      </div>
    </div>
  );
}
