'use client';

import type {
  PaymentCurrencyCode,
  StaffCompensationModeDto,
  StaffPayFrequencyDto,
  StaffPayoutDefaultsDto,
} from '@pkg/types';
import { CalendarClock, Coins, ShieldCheck } from 'lucide-react';
import { Field } from '../../components/ui';
import { staffCompensationModeLabel, staffPayFrequencyLabel } from '../../lib/staff-payout-ui';
import {
  STAFF_COMPENSATION_MODE_OPTIONS,
  STAFF_PAY_FREQUENCY_OPTIONS,
  STAFF_PAY_MONTH_DAY_OPTIONS,
  STAFF_PAY_WEEKDAY_OPTIONS,
  STAFF_PAYOUT_CURRENCY_OPTIONS,
} from './constants';
import { majorInputToMinor, minorToMajorInput } from './money';
import styles from './staff-payout.module.scss';

type FieldShellClasses = {
  fieldGroupClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
};

type StaffPayoutDefaultsFieldsProps = FieldShellClasses & {
  draft: StaffPayoutDefaultsDto;
  onChange: (next: StaffPayoutDefaultsDto) => void;
  disabled?: boolean;
};

export function StaffPayoutDefaultsFields({
  draft,
  onChange,
  disabled = false,
  fieldGroupClassName = styles.fieldGroup,
  labelClassName = styles.label,
  inputClassName = styles.input,
}: StaffPayoutDefaultsFieldsProps) {
  const showLessonRate = draft.defaultMode === 'per_lesson' || draft.defaultMode === 'mixed';
  const showSalary = draft.defaultMode === 'salary' || draft.defaultMode === 'mixed';

  return (
    <div className={styles.compensationSections}>
      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <Coins size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Default pay structure</h4>
            <p className={styles.compensationSectionText}>
              Baseline mode, currency, and rates for new staff accrual calculations.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-mode">
              Default compensation mode
            </label>
            <Field
              as="select"
              id="payout-default-mode"
              className={inputClassName}
              value={draft.defaultMode}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...draft,
                  defaultMode: event.target.value as StaffCompensationModeDto,
                })
              }
            >
              {STAFF_COMPENSATION_MODE_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {staffCompensationModeLabel(mode)}
                </option>
              ))}
            </Field>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-currency">
              Currency
            </label>
            <Field
              as="select"
              id="payout-default-currency"
              className={inputClassName}
              value={draft.defaultCurrency}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...draft,
                  defaultCurrency: event.target.value as PaymentCurrencyCode,
                })
              }
            >
              {STAFF_PAYOUT_CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Field>
          </div>

          {showLessonRate ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="payout-default-lesson-rate">
                Default per-lesson rate
              </label>
              <Field
                id="payout-default-lesson-rate"
                type="number"
                className={inputClassName}
                min={0}
                step="0.01"
                disabled={disabled}
                value={minorToMajorInput(draft.defaultPerLessonRateMinor)}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    defaultPerLessonRateMinor: majorInputToMinor(event.target.value),
                  })
                }
              />
            </div>
          ) : null}

          {showSalary ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="payout-default-salary">
                Default salary ({staffPayFrequencyLabel(draft.defaultPayFrequency)})
              </label>
              <Field
                id="payout-default-salary"
                type="number"
                className={inputClassName}
                min={0}
                step="0.01"
                disabled={disabled}
                value={minorToMajorInput(draft.defaultSalaryMinor)}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    defaultSalaryMinor: majorInputToMinor(event.target.value),
                  })
                }
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <CalendarClock size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Default pay schedule</h4>
            <p className={styles.compensationSectionText}>
              When outstanding balances become due unless a staff profile overrides this.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-frequency">
              Pay frequency
            </label>
            <Field
              as="select"
              id="payout-default-frequency"
              className={inputClassName}
              value={draft.defaultPayFrequency}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...draft,
                  defaultPayFrequency: event.target.value as StaffPayFrequencyDto,
                })
              }
            >
              {STAFF_PAY_FREQUENCY_OPTIONS.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {staffPayFrequencyLabel(frequency)}
                </option>
              ))}
            </Field>
          </div>

          {draft.defaultPayFrequency === 'weekly' ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="payout-default-weekday">
                Pay day (week)
              </label>
              <Field
                as="select"
                id="payout-default-weekday"
                className={inputClassName}
                value={String(draft.defaultPayDayOfWeek)}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    defaultPayDayOfWeek: Number.parseInt(event.target.value, 10),
                  })
                }
              >
                {STAFF_PAY_WEEKDAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
            </div>
          ) : (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="payout-default-monthday">
                Pay day of month (1–28)
              </label>
              <Field
                as="select"
                id="payout-default-monthday"
                className={inputClassName}
                value={String(draft.defaultPayDayOfMonth)}
                disabled={disabled}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    defaultPayDayOfMonth: Number.parseInt(event.target.value, 10) || 1,
                  })
                }
              >
                {STAFF_PAY_MONTH_DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </Field>
            </div>
          )}
        </div>
      </section>

      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <ShieldCheck size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Overdue rules</h4>
            <p className={styles.compensationSectionText}>
              Grace period before due payouts appear as overdue on finance dashboards.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-grace">
              Grace days before overdue
            </label>
            <Field
              id="payout-default-grace"
              type="number"
              className={inputClassName}
              min={0}
              disabled={disabled}
              value={String(draft.defaultGraceDays)}
              onChange={(event) =>
                onChange({
                  ...draft,
                  defaultGraceDays: Number.parseInt(event.target.value, 10) || 0,
                })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
