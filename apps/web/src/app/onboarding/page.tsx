'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import { track } from '../../lib/analytics';
import { Button, Field, SurfaceCard } from '../../components/ui';
import type { PaymentMethodStatusDto } from '@pkg/types';
import styles from './page.module.scss';

type StepKey = 'profile' | 'teaching' | 'payments' | 'invite' | 'sample-content';

const STEPS: Array<{ key: StepKey; title: string }> = [
  { key: 'profile', title: 'School profile' },
  { key: 'teaching', title: 'Teaching setup' },
  { key: 'payments', title: 'Payments' },
  { key: 'invite', title: 'Invite teammates' },
  { key: 'sample-content', title: 'Sample content' },
];

type StepData = Record<string, Record<string, unknown>>;

interface OnboardingState {
  completed: boolean;
  currentStep: string | null;
  steps: StepData;
}

export default function OnboardingPage() {
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
        const at = STEPS.findIndex((s) => s.key === state.currentStep);
        // resume on the step *after* the last saved one, clamped to the last step
        if (at >= 0) setIndex(Math.min(at + 1, STEPS.length - 1));
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load onboarding');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const stepData = data[step.key] ?? {};

  const setField = useCallback(
    (key: string, value: unknown) => {
      setData((prev) => ({ ...prev, [step.key]: { ...(prev[step.key] ?? {}), [key]: value } }));
    },
    [step.key],
  );

  async function persistStep() {
    await apiClient.patch('/onboarding/step', { step: step.key, data: stepData });
  }

  async function onNext(save: boolean) {
    setBusy(true);
    setError(null);
    try {
      if (save) {
        await persistStep();
        track({ name: 'wizard_step_completed', step: step.key, schoolId: '' });
      }
      if (isLast) {
        await apiClient.post('/onboarding/complete');
        track({ name: 'wizard_completed', schoolId: '' });
        router.replace('/dashboard');
        return;
      }
      setIndex((i) => i + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className={styles.shell}>Loading…</div>;

  return (
    <div className={styles.shell}>
      <SurfaceCard className={styles.card}>
        <div className={styles.progress}>
          Step {index + 1} of {STEPS.length}
        </div>
        <h1 className={styles.title}>{step.title}</h1>

        {error ? (
          <div className={styles.error} role="alert">
            {error}
          </div>
        ) : null}

        <div className={styles.fields}>
          <StepFields stepKey={step.key} data={stepData} setField={setField} />
        </div>

        <div className={styles.actions}>
          {!isLast ? (
            <Button variant="ghost" disabled={busy} onClick={() => void onNext(false)}>
              Skip
            </Button>
          ) : null}
          <Button
            variant="primary"
            loading={busy}
            loadingLabel="Saving…"
            onClick={() => void onNext(true)}
          >
            {isLast ? 'Finish' : 'Save & continue'}
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
  const str = (k: string) => (typeof data[k] === 'string' ? (data[k] as string) : '');

  if (stepKey === 'profile') {
    return (
      <>
        <Field
          id="ob-timezone"
          label="Timezone"
          value={str('timezone')}
          onChange={(e) => setField('timezone', e.target.value)}
        />
        <Field
          id="ob-locale"
          as="select"
          label="Default language"
          value={str('locale') || 'uk'}
          onChange={(e) => setField('locale', e.target.value)}
        >
          <option value="uk">Ukrainian</option>
          <option value="en">English</option>
        </Field>
        <Field
          id="ob-accent"
          label="Accent color"
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
          label="Languages you teach"
          hint="Comma-separated for now"
          value={str('languages')}
          onChange={(e) => setField('languages', e.target.value)}
        />
        <Field
          id="ob-format"
          as="select"
          label="Default lesson format"
          value={str('lessonFormat') || 'online'}
          onChange={(e) => setField('lessonFormat', e.target.value)}
        >
          <option value="online">Online</option>
          <option value="in-person">In person</option>
          <option value="hybrid">Hybrid</option>
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
        label="Invite teammates"
        hint="One email per line — invitations are sent after setup"
        value={str('emails')}
        onChange={(e) => setField('emails', e.target.value)}
      />
    );
  }
  return (
    <Field
      id="ob-sample"
      as="select"
      label="Seed demo lessons & materials?"
      value={str('seed') || 'yes'}
      onChange={(e) => setField('seed', e.target.value)}
    >
      <option value="yes">Yes, add sample content</option>
      <option value="no">No thanks</option>
    </Field>
  );
}

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

function PaymentsStepFields({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (methods: string[]) => void;
}) {
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
    return (
      <p className={styles.note}>
        Could not load payment methods. You can enable them later in Settings → Payments.
      </p>
    );
  }

  if (methods.length === 0) {
    return <p className={styles.note}>Loading payment options…</p>;
  }

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((m) => m !== id) : [...selected, id]);
  };

  return (
    <div className={styles.checkGroup}>
      <p className={styles.note}>
        Select which payment methods to enable. You can change this later in Settings → Payments.
      </p>
      {methods.map((m) => (
        <label key={m.id} className={styles.checkRow}>
          <input
            type="checkbox"
            checked={selected.includes(m.id)}
            onChange={() => toggle(m.id)}
          />
          <span>{METHOD_LABELS[m.id] ?? m.id}</span>
        </label>
      ))}
    </div>
  );
}
