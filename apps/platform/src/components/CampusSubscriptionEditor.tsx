'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field } from '@fe/ui';
import ui from './ui/ui.module.scss';
import styles from './CampusSubscriptionEditor.module.scss';

export type PlanPriceDraft = {
  stripePriceId: string;
  amountMinor: string;
};

export type OfferDraft = {
  railId: string;
  currency: string;
  prices: { STARTER: PlanPriceDraft; PRO: PlanPriceDraft };
};

export type AvailableRail = {
  id: string;
  title: string;
  pricingMode: 'stripe' | 'amount';
};

export type CampusSubscriptionClientDto = {
  default: {
    railId: string;
    currency: string;
    prices: {
      STARTER?: { stripePriceId?: string; amountMinor?: number };
      PRO?: { stripePriceId?: string; amountMinor?: number };
    };
  };
  countryOverrides: Array<{
    country: string;
    railId: string;
    currency: string;
    prices: {
      STARTER?: { stripePriceId?: string; amountMinor?: number };
      PRO?: { stripePriceId?: string; amountMinor?: number };
    };
  }>;
  availableRails: AvailableRail[];
};

function toPriceDraft(p?: { stripePriceId?: string; amountMinor?: number }): PlanPriceDraft {
  return {
    stripePriceId: p?.stripePriceId ?? '',
    amountMinor: p?.amountMinor != null ? String(p.amountMinor) : '',
  };
}

function fromPriceDraft(
  p: PlanPriceDraft,
  pricingMode: 'stripe' | 'amount',
): { stripePriceId?: string; amountMinor?: number } {
  const n = Number(p.amountMinor);
  const amountMinor =
    p.amountMinor.trim() && Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
  if (pricingMode === 'amount') {
    return { amountMinor };
  }
  const stripePriceId = p.stripePriceId.trim() || undefined;
  return { stripePriceId, amountMinor };
}

function toOfferDraft(
  o: {
    railId: string;
    currency: string;
    prices: CampusSubscriptionClientDto['default']['prices'];
  },
  available: AvailableRail[],
): OfferDraft {
  const allowed = new Set(available.map((r) => r.id));
  const railId = allowed.has(o.railId) ? o.railId : (available[0]?.id ?? '');
  return {
    railId,
    currency: o.currency,
    prices: {
      STARTER: toPriceDraft(o.prices.STARTER),
      PRO: toPriceDraft(o.prices.PRO),
    },
  };
}

function emptyOffer(railId: string): OfferDraft {
  return {
    railId,
    currency: 'EUR',
    prices: {
      STARTER: { stripePriceId: '', amountMinor: '' },
      PRO: { stripePriceId: '', amountMinor: '' },
    },
  };
}

function pricingModeOf(railId: string, rails: AvailableRail[]): 'stripe' | 'amount' {
  return rails.find((r) => r.id === railId)?.pricingMode ?? 'amount';
}

function scrubPricesForMode(
  prices: OfferDraft['prices'],
  mode: 'stripe' | 'amount',
): OfferDraft['prices'] {
  if (mode === 'stripe') return prices;
  return {
    STARTER: { stripePriceId: '', amountMinor: prices.STARTER.amountMinor },
    PRO: { stripePriceId: '', amountMinor: prices.PRO.amountMinor },
  };
}

function formatMinorPreview(amountMinor: string, currency: string): string | null {
  const n = Number(amountMinor);
  if (!amountMinor.trim() || !Number.isFinite(n) || n <= 0) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.trim().toUpperCase() || 'EUR',
      maximumFractionDigits: 2,
    }).format(n / 100);
  } catch {
    return `${(n / 100).toFixed(2)} ${currency || ''}`.trim();
  }
}

function PriceFields({
  label,
  value,
  pricingMode,
  currency,
  onChange,
}: {
  label: string;
  value: PlanPriceDraft;
  pricingMode: 'stripe' | 'amount';
  currency: string;
  onChange: (next: PlanPriceDraft) => void;
}) {
  const preview = formatMinorPreview(value.amountMinor, currency);
  return (
    <div className={styles.priceBlock}>
      <p className={styles.priceLabel}>{label}</p>
      <p className={[styles.pricePreview, preview ? '' : styles.pricePreviewMuted].filter(Boolean).join(' ')}>
        {preview ?? 'No price set'}
      </p>
      {pricingMode === 'stripe' ? (
        <Field
          label="Stripe price ID"
          placeholder="price_…"
          value={value.stripePriceId}
          onChange={(e) => onChange({ ...value, stripePriceId: e.target.value })}
        />
      ) : null}
      <Field
        label={pricingMode === 'stripe' ? 'Amount (minor, optional)' : 'Amount (minor units)'}
        placeholder="e.g. 2900 → 29.00"
        value={value.amountMinor}
        onChange={(e) => onChange({ ...value, amountMinor: e.target.value })}
      />
    </div>
  );
}

function OfferFields({
  draft,
  rails,
  onChange,
  showCountry,
  country,
  onCountryChange,
}: {
  draft: OfferDraft;
  rails: AvailableRail[];
  onChange: (next: OfferDraft) => void;
  showCountry?: boolean;
  country?: string;
  onCountryChange?: (c: string) => void;
}) {
  const mode = pricingModeOf(draft.railId, rails);
  return (
    <>
      <div className={styles.metaRow}>
        {showCountry ? (
          <Field
            label="Country (ISO alpha-2)"
            placeholder="UA"
            value={country ?? ''}
            onChange={(e) => onCountryChange?.(e.target.value.toUpperCase())}
          />
        ) : null}
        <Field
          as="select"
          label="Payment rail"
          value={rails.some((r) => r.id === draft.railId) ? draft.railId : ''}
          disabled={rails.length === 0}
          onChange={(e) => {
            const railId = e.target.value;
            const nextMode = pricingModeOf(railId, rails);
            onChange({
              ...draft,
              railId,
              prices: scrubPricesForMode(draft.prices, nextMode),
            });
          }}
        >
          {rails.length === 0 ? <option value="">No rails available</option> : null}
          {rails.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </Field>
        <Field
          label="Currency"
          placeholder="EUR"
          value={draft.currency}
          onChange={(e) => onChange({ ...draft, currency: e.target.value.toUpperCase() })}
        />
      </div>
      {mode === 'stripe' ? (
        <p className={styles.modeNote}>
          Stripe rail: prefer a Price ID from the platform Stripe account. Amount is a fallback for
          Checkout <code>price_data</code> when the Price ID is empty.
        </p>
      ) : (
        <p className={styles.modeNote}>
          Amount rail: set minor units + currency only (no Stripe Price ID).
        </p>
      )}
      <div className={styles.plansGrid}>
        <PriceFields
          label="Starter"
          pricingMode={mode}
          currency={draft.currency}
          value={draft.prices.STARTER}
          onChange={(STARTER) => onChange({ ...draft, prices: { ...draft.prices, STARTER } })}
        />
        <PriceFields
          label="Pro"
          pricingMode={mode}
          currency={draft.currency}
          value={draft.prices.PRO}
          onChange={(PRO) => onChange({ ...draft, prices: { ...draft.prices, PRO } })}
        />
      </div>
    </>
  );
}

/**
 * Default + per-country Campus→Arvilio subscription offers (ADR-010).
 */
export function CampusSubscriptionEditor({ initial }: { initial: CampusSubscriptionClientDto }) {
  const router = useRouter();
  const availableRails = initial.availableRails;

  const [defaultOffer, setDefaultOffer] = useState(() =>
    toOfferDraft(initial.default, availableRails),
  );
  const [overrides, setOverrides] = useState(() =>
    initial.countryOverrides.map((o) => ({
      country: o.country,
      offer: toOfferDraft(o, availableRails),
    })),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const allowedIds = useMemo(() => new Set(availableRails.map((r) => r.id)), [availableRails]);

  function markDirty() {
    setSaved(false);
  }

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      if (!allowedIds.has(defaultOffer.railId)) {
        throw new Error('Default rail is not available — pick an enabled configured rail');
      }
      for (const row of overrides) {
        if (!allowedIds.has(row.offer.railId)) {
          throw new Error(
            `Override ${row.country || '(country)'} uses an unavailable rail — pick another`,
          );
        }
      }
      const body = {
        default: {
          railId: defaultOffer.railId,
          currency: defaultOffer.currency,
          prices: {
            STARTER: fromPriceDraft(
              defaultOffer.prices.STARTER,
              pricingModeOf(defaultOffer.railId, availableRails),
            ),
            PRO: fromPriceDraft(
              defaultOffer.prices.PRO,
              pricingModeOf(defaultOffer.railId, availableRails),
            ),
          },
        },
        countryOverrides: overrides.map((row) => ({
          country: row.country,
          railId: row.offer.railId,
          currency: row.offer.currency,
          prices: {
            STARTER: fromPriceDraft(
              row.offer.prices.STARTER,
              pricingModeOf(row.offer.railId, availableRails),
            ),
            PRO: fromPriceDraft(
              row.offer.prices.PRO,
              pricingModeOf(row.offer.railId, availableRails),
            ),
          },
        })),
      };
      const res = await fetch('/api/platform/billing/campus-subscription', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `Save failed (${res.status})`);
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setPending(false);
    }
  }

  const fallbackRail = availableRails[0]?.id ?? '';

  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        Default offer applies when a campus has no billing country or no matching override. Only
        rails that are enabled and configured under Payment rails appear here. Stripe may show as
        configured via env even if secrets fields are empty in the UI.
      </p>

      {availableRails.length === 0 ? (
        <p className={styles.emptyState}>
          No payment rails are ready. On Payment rails: enable a method, fill secrets until you see
          the Configured badge, then return here. Stripe can also become ready via{' '}
          <code>STRIPE_PLATFORM_*</code> env without UI secrets.
        </p>
      ) : (
        <>
          <section className={styles.offerCard}>
            <div className={styles.offerCardHead}>
              <div>
                <h3 className={styles.offerCardTitle}>Default offer</h3>
                <p className={styles.offerCardHint}>
                  Fallback for every campus without a country override.
                </p>
              </div>
            </div>
            <OfferFields
              draft={defaultOffer}
              rails={availableRails}
              onChange={(next) => {
                markDirty();
                setDefaultOffer(next);
              }}
            />
          </section>

          <section>
            <div className={styles.sectionHead}>
              <div>
                <h3 className={styles.sectionTitle}>Country overrides</h3>
                <p className={styles.sectionHint}>
                  Per-country rail and price matrix (ISO alpha-2).
                </p>
              </div>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  markDirty();
                  setOverrides((prev) => [
                    ...prev,
                    { country: '', offer: emptyOffer(fallbackRail) },
                  ]);
                }}
              >
                Add country
              </Button>
            </div>
            {overrides.length === 0 ? (
              <p className={styles.emptyState} style={{ marginTop: 12 }}>
                No overrides — all campuses use the default offer.
              </p>
            ) : (
              <ul className={styles.overrideList} style={{ marginTop: 12 }}>
                {overrides.map((row, index) => (
                  <li key={index} className={styles.offerCard}>
                    <div className={styles.overrideCardHead}>
                      <span
                        className={[
                          styles.countryBadge,
                          row.country.trim() ? '' : styles.countryBadgeEmpty,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {row.country.trim() || 'Country'}
                      </span>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          markDirty();
                          setOverrides((prev) => prev.filter((_, i) => i !== index));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                    <OfferFields
                      showCountry
                      country={row.country}
                      onCountryChange={(country) => {
                        markDirty();
                        setOverrides((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, country } : r)),
                        );
                      }}
                      draft={row.offer}
                      rails={availableRails}
                      onChange={(offer) => {
                        markDirty();
                        setOverrides((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, offer } : r)),
                        );
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <div className={styles.footer}>
        <Button
          variant="primary"
          disabled={pending || availableRails.length === 0}
          loading={pending}
          onClick={() => void save()}
        >
          Save campus plans
        </Button>
        {saved ? <span className={`${ui.inlineMsg} ${ui.inlineOk}`}>Saved</span> : null}
        {error ? <span className={`${ui.inlineMsg} ${ui.inlineErr}`}>{error}</span> : null}
      </div>
    </div>
  );
}
