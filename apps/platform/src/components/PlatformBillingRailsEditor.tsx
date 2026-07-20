'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '@fe/ui';
import ui from './ui/ui.module.scss';
import { PaymentMethodLogo } from './PaymentMethodLogo';
import styles from './PlatformBillingRails.module.scss';

export type PlatformBillingRailClientDto = {
  id: string;
  title: string;
  description: string;
  regions: string[];
  brandBg: string;
  brandFg: string;
  enabled: boolean;
  configured: boolean;
  config: Record<string, string>;
  configFields: Array<{ key: string; label: string; placeholder?: string }>;
  secretFields: Array<{
    key: string;
    label: string;
    status: { configured: boolean; source: 'system' | 'env' | 'missing' };
  }>;
};

type Draft = {
  enabled: boolean;
  config: Record<string, string>;
  secrets: Record<string, string>;
};

function regionLabel(regions: string[]): string {
  if (regions.includes('*')) return 'Global';
  if (regions.length === 1 && regions[0] === 'UA') return 'Ukraine';
  return regions.join(', ');
}

function logoMethodForRail(id: string): string {
  if (id.startsWith('stripe')) return 'STRIPE';
  if (id.startsWith('liqpay')) return 'LIQPAY';
  if (id.startsWith('monopay')) return 'MONOPAY';
  if (id.startsWith('wayforpay')) return 'WAYFORPAY';
  return 'MANUAL_INVOICE';
}

function secretHint(status: { configured: boolean; source: string }): string {
  if (status.source === 'env') return 'Configured via env (leave blank to keep)';
  if (status.source === 'system') return 'Saved in Control Plane (enter new value to replace)';
  return 'Not configured';
}

function allMarketKeys(rails: PlatformBillingRailClientDto[]): string[] {
  const set = new Set<string>();
  for (const r of rails) {
    for (const region of r.regions) set.add(region === '*' ? 'Global' : region);
  }
  return Array.from(set).sort();
}

/**
 * Platform PSP adapters (credentials). Prices live under Campus plans.
 */
export function PlatformBillingRailsEditor({
  initial,
}: {
  initial: { rails: PlatformBillingRailClientDto[]; defaultRailId: string };
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    const map: Record<string, Draft> = {};
    for (const rail of initial.rails) {
      map[rail.id] = {
        enabled: rail.enabled,
        config: { ...rail.config },
        secrets: {},
      };
    }
    return map;
  });
  const [defaultRailId, setDefaultRailId] = useState(initial.defaultRailId);
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const markets = useMemo(() => allMarketKeys(initial.rails), [initial.rails]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initial.rails.filter((rail) => {
      if (q) {
        const hay = `${rail.title} ${rail.id} ${rail.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (marketFilter !== 'all') {
        if (marketFilter === 'Global') {
          if (!rail.regions.includes('*')) return false;
        } else if (!rail.regions.includes(marketFilter) && !rail.regions.includes('*')) {
          return false;
        }
      }
      return true;
    });
  }, [initial.rails, query, marketFilter]);

  function patchDraft(id: string, patch: Partial<Draft>) {
    setSaved(false);
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function setEnabled(id: string, enabled: boolean) {
    if (!enabled && defaultRailId === id) {
      const next = initial.rails.find(
        (r) => r.id !== id && (drafts[r.id]?.enabled ?? r.enabled),
      );
      if (next) setDefaultRailId(next.id);
    }
    patchDraft(id, { enabled });
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const rails = Object.entries(drafts).map(([id, d]) => ({
        id,
        enabled: d.enabled,
        config: d.config,
        secrets: Object.fromEntries(
          Object.entries(d.secrets).filter(([, v]) => typeof v === 'string' && v.trim()),
        ),
      }));
      const res = await fetch('/api/platform/billing/rails', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultRailId, rails }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Save failed (${res.status})`);
      }
      setSaved(true);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(next)) {
          next[id] = { ...next[id], secrets: {} };
        }
        return next;
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  async function testRail(id: string) {
    setTestingId(id);
    setTestMsg((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      const res = await fetch(`/api/platform/billing/rails/${encodeURIComponent(id)}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message ?? `Test failed (${res.status})`);
      }
      setTestMsg((prev) => ({
        ...prev,
        [id]: { ok: Boolean(body.ok), text: body.message ?? (body.ok ? 'OK' : 'Failed') },
      }));
    } catch (e) {
      setTestMsg((prev) => ({
        ...prev,
        [id]: { ok: false, text: e instanceof Error ? e.message : 'Test failed' },
      }));
    } finally {
      setTestingId(null);
    }
  }

  return (
    <div>
      <p className={ui.mutedCopy}>
        Choose one default rail and enable adapters Arvilio uses to charge campuses. Only enabled
        and configured rails appear in Campus plans. Learner methods stay in Settings.
      </p>

      <div className={styles.toolbar}>
        <Field
          label="Search"
          placeholder="Stripe, LiqPay…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Field
          as="select"
          label="Market"
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
        >
          <option value="all">All markets</option>
          {markets.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Field>
      </div>

      <div className={styles.railList}>
        {filtered.length === 0 ? (
          <p className={ui.mutedCopy}>No rails match these filters.</p>
        ) : null}
        {filtered.map((rail) => {
          const draft = drafts[rail.id] ?? {
            enabled: rail.enabled,
            config: {},
            secrets: {},
          };
          const open = expanded === rail.id;
          const isDefault = defaultRailId === rail.id;
          const test = testMsg[rail.id];
          return (
            <article
              key={rail.id}
              className={[
                styles.railCard,
                draft.enabled ? styles.railCardOn : '',
                isDefault ? styles.railCardDefault : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.railHead}>
                <span
                  className={styles.railLogo}
                  style={{ background: rail.brandBg, color: rail.brandFg }}
                >
                  <PaymentMethodLogo
                    method={logoMethodForRail(rail.id)}
                    className={styles.railLogoSvg}
                  />
                </span>
                <div className={styles.railMeta}>
                  <div className={styles.railTitleRow}>
                    <h3 className={styles.railTitle}>{rail.title}</h3>
                    <span className={styles.regionBadge}>{regionLabel(rail.regions)}</span>
                    {rail.configured ? (
                      <span className={styles.configuredBadge}>Configured</span>
                    ) : (
                      <span className={styles.missingBadge}>Not configured</span>
                    )}
                    {isDefault ? <span className={styles.defaultBadge}>Default</span> : null}
                  </div>
                  <p className={styles.railDesc}>{rail.description}</p>
                </div>
                <div className={styles.railActions}>
                  <Field
                    as="radio"
                    label="Default"
                    name="defaultRail"
                    checked={isDefault}
                    disabled={!draft.enabled}
                    onChange={() => {
                      setSaved(false);
                      setDefaultRailId(rail.id);
                    }}
                  />
                  <Field
                    as="checkbox"
                    label={draft.enabled ? 'On' : 'Off'}
                    checked={draft.enabled}
                    onChange={(e) => setEnabled(rail.id, e.target.checked)}
                  />
                </div>
              </div>
              <div className={styles.railFooter}>
                <Button
                  type="button"
                  variant="ghost"
                  className={styles.configToggle}
                  onClick={() => setExpanded(open ? null : rail.id)}
                >
                  {open ? 'Hide configuration' : 'Configure'}
                </Button>
                {rail.configured ? (
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={testingId === rail.id}
                    loading={testingId === rail.id}
                    loadingLabel="Testing…"
                    onClick={() => void testRail(rail.id)}
                  >
                    Test connection
                  </Button>
                ) : null}
              </div>
              {test ? (
                <p className={test.ok ? styles.testOk : styles.testErr}>{test.text}</p>
              ) : null}
              {open ? (
                <div className={styles.configPanel}>
                  {rail.configFields.map((field) => (
                    <Field
                      key={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={draft.config[field.key] ?? ''}
                      onChange={(e) =>
                        patchDraft(rail.id, {
                          config: { ...draft.config, [field.key]: e.target.value },
                        })
                      }
                    />
                  ))}
                  {rail.secretFields.map((field) => (
                    <Field
                      key={field.key}
                      label={field.label}
                      type="password"
                      autoComplete="off"
                      placeholder={
                        field.status.configured ? '•••••••• (unchanged if empty)' : 'Enter secret'
                      }
                      hint={secretHint(field.status)}
                      value={draft.secrets[field.key] ?? ''}
                      onChange={(e) =>
                        patchDraft(rail.id, {
                          secrets: { ...draft.secrets, [field.key]: e.target.value },
                        })
                      }
                    />
                  ))}
                  {rail.configFields.length === 0 && rail.secretFields.length === 0 ? (
                    <p className={ui.mutedCopy}>No fields for this rail yet.</p>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className={ui.actionRow}>
        <Button variant="primary" disabled={pending} loading={pending} onClick={() => void save()}>
          Save payment rails
        </Button>
        {saved ? <span className={`${ui.inlineMsg} ${ui.inlineOk}`}>Saved</span> : null}
        {error ? <span className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</span> : null}
      </div>
    </div>
  );
}
