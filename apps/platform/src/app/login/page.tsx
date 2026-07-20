'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button, Field } from '@fe/ui';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/platform/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
        const msg = Array.isArray(body?.message)
          ? body.message.join(', ')
          : body?.message || 'Invalid credentials';
        throw new Error(msg);
      }
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Arvilio</span>
          <p className={styles.brandSub}>Control Plane</p>
        </div>
        <h1 className={styles.title}>
          <Lock className={styles.titleIcon} size={22} aria-hidden />
          Sign in
        </h1>
        <p className={styles.subtitle}>
          Restricted area. Access for platform administrators only.
        </p>
        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          {error ? <p className={styles.error}>{error}</p> : null}
          <Field
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" loading={submitting} loadingLabel="Signing in…">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
