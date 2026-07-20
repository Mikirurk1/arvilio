'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocaleMeta } from '@pkg/types';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { Button, Field, SurfaceCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import type { PaymentMethodStatusDto } from '@pkg/types';
import styles from './page.module.scss';

type StepKey = 'profile' | 'teaching' | 'payments' | 'invite' | 'sample-content';

const STEP_KEYS: StepKey[] = ['profile', 'teaching', 'payments', 'invite', 'sample-content'];

type StepData = Record<string, Record<string, unknown>>;

interface OnboardingState {
  completed: boolean;
  currentStep: string | null;
  steps: StepData;
}

/** Brand / PSP names — not UI chrome; keep as product identifiers. */
const METHOD_LABELS: Record<string, string> = {
  manual_invoice: 'Manual invoice',
  stripe: 'Stripe',
  liqpay: 'LiqPay',
  wayforpay: 'WayForPay',
  lemonsqueezy: 'Lemon Squeezy',
  paddle: 'Paddle',
  monopay: 'Monobank (monobank)',
  paypal: 'PayPal',
};

export default function OnboardingPage() {
  const t = useCampusT();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<StepData>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiClient
      .get<OnboardingState>('/onboarding')
      .then((state) => {
        if (!active) return;
        if (state.completed) {
          router.replace('/dashboard');
          return;
        }
        setData(state.steps ?? {});
        const at = STEP_KEYS.findIndex((key) => key === state.currentStep);
        // resume on the step *after* the last saved one, clamped to the last step
        if (at >= 0) setIndex(Math.min(at + 1, STEP_KEYS.length - 1));
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : t('onboarding.loadError'));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router, t]);

  const stepKey = STEP_KEYS[index]!;
  const isLast = index === STEP_KEYS.length - 1;
  const stepData = data[stepKey] ?? {};

  const setField = useCallback(
    (key: string, value: unknown) => {
      setData((prev) => ({ ...prev, [stepKey]: { ...(prev[stepKey] ?? {}), [key]: value } }));
    },
    [stepKey],
  );

  async function persistStep() {
    await apiClient.patch('/onboarding/step', { step: stepKey, data: stepData });
  }

  async function onNext(save: boolean) {
    setBusy(true);
    setError(null);
    try {
      if (save) {
        await persistStep();
        track({ name: 'wizard_step_completed', step: stepKey, schoolId: '' });
      }
      if (isLast) {
        await apiClient.post('/onboarding/complete');
        track({ name: 'wizard_completed', schoolId: '' });
        router.replace('/dashboard');
        return;
      }
      setIndex((i) => i + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('onboarding.saveError'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className={styles.shell}>{t('onboarding.loading')}</div>;

  return (
    <div className={styles.shell}>
      <SurfaceCard className={styles.card}>
        <div className={styles.progress}>
          {t('onboarding.progress', { current: index + 1, total: STEP_KEYS.length })}
        </div>
        <h1 className={styles.title}>{t(`onboarding.step.${stepKey}`)}</h1>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        <div className={styles.fields}>
          <StepFields stepKey={stepKey} data={stepData} setField={setField} />
        </div>

        <div className={styles.actions}>
          {!isLast ? (
            <Button variant="ghost" disabled={busy} onClick={() => void onNext(false)}>
              {t('onboarding.skip')}
            </Button>
          ) : null}
          <Button
            variant="primary"
            loading={busy}
            loadingLabel={t('onboarding.saving')}
            onClick={() => void onNext(true)}
          >
            {isLast ? t('onboarding.finish') : t('onboarding.next')}
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}

function StepFields({
  stepKey,
  data,
  setField,
}: {
  stepKey: StepKey;
  data: Record<string, unknown>;
  setField: (key: string, value: unknown) => void;
}) {
  const t = useCampusT();
  const str = (k: string) => (typeof data[k] === 'string' ? (data[k] as string) : '');

  if (stepKey === 'profile') {
    return (
      <>
        <Field
          id="ob-timezone"
          label={t('onboarding.profile.timezone')}
          value={str('timezone')}
          onChange={(e) => setField('timezone', e.target.value)}
        />
        <Field
          id="ob-locale"
          as="select"
          label={t('onboarding.profile.locale')}
          value={str('locale') || 'en'}
          onChange={(e) => setField('locale', e.target.value)}
        >
          <option value="uk">{getLocaleMeta('uk').nativeName}</option>
          <option value="en">{getLocaleMeta('en').nativeName}</option>
        </Field>
        <Field
          id="ob-accent"
          label={t('onboarding.profile.accent')}
          placeholder="#2f6f4f"
          value={str('accentColor')}
          onChange={(e) => setField('accentColor', e.target.value)}
        />
      </>
    );
  }
  if (stepKey === 'teaching') {
    return (
      <>
        <Field
          id="ob-langs"
          label={t('onboarding.teaching.languages')}
          hint={t('onboarding.teaching.languagesHint')}
          value={str('languages')}
          onChange={(e) => setField('languages', e.target.value)}
        />
        <Field
          id="ob-format"
          as="select"
          label={t('onboarding.teaching.format')}
          value={str('lessonFormat') || 'online'}
          onChange={(e) => setField('lessonFormat', e.target.value)}
        >
          <option value="online">{t('onboarding.teaching.format.online')}</option>
          <option value="in-person">{t('onboarding.teaching.format.inPerson')}</option>
          <option value="hybrid">{t('onboarding.teaching.format.hybrid')}</option>
        </Field>
      </>
    );
  }
  if (stepKey === 'payments') {
    return (
      <PaymentsStepFields
        selected={(data['methods'] as string[] | undefined) ?? []}
        onChange={(methods) => setField('methods', methods)}
      />
    );
  }
  if (stepKey === 'invite') {
    return (
      <Field
        id="ob-invites"
        as="textarea"
        label={t('onboarding.invite.label')}
        hint={t('onboarding.invite.hint')}
        value={str('emails')}
        onChange={(e) => setField('emails', e.target.value)}
      />
    );
  }
  return (
    <Field
      id="ob-sample"
      as="select"
      label={t('onboarding.sample.label')}
      value={str('seed') || 'yes'}
      onChange={(e) => setField('seed', e.target.value)}
    >
      <option value="yes">{t('onboarding.sample.yes')}</option>
      <option value="no">{t('onboarding.sample.no')}</option>
    </Field>
  );
}

function PaymentsStepFields({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (methods: string[]) => void;
}) {
  const t = useCampusT();
  const [methods, setMethods] = useState<PaymentMethodStatusDto[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .get<{ methods: PaymentMethodStatusDto[] }>('/billing/payment-settings')
      .then((res) => {
        if (active) setMethods(res.methods);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loadError) {
    return <p className={styles.note}>{t('onboarding.payments.loadError')}</p>;
  }

  if (methods.length === 0) {
    return <p className={styles.note}>{t('onboarding.payments.loading')}</p>;
  }

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((m) => m !== id) : [...selected, id]);
  };

  return (
    <div className={styles.checkGroup}>
      <p className={styles.note}>{t('onboarding.payments.intro')}</p>
      {methods.map((m) => (
        <Field
          key={m.id}
          as="checkbox"
          checked={selected.includes(m.id)}
          onChange={() => toggle(m.id)}
          label={
            m.id === 'manual_invoice' ? t('payment.bankTransfer') : (METHOD_LABELS[m.id] ?? m.id)
          }
          rootClassName={styles.checkRow}
        />
      ))}
    </div>
  );
}
