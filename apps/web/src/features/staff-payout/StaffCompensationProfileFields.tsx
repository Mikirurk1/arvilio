'use client';

import type {
  PaymentCurrencyCode,
  StaffCompensationModeDto,
  StaffCompensationProfileDto,
  StaffPayFrequencyDto,
  StaffPayoutDefaultsDto,
} from '@pkg/types';
import { resolveStaffCompensation } from '@pkg/types';
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

type StaffCompensationProfileFieldsProps = FieldShellClasses & {
  userId: string;
  defaults: StaffPayoutDefaultsDto;
  draft: StaffCompensationProfileDto;
  onChange: (next: StaffCompensationProfileDto) => void;
  disabled?: boolean;
};

function inheritHint(label: string, value: string): string {
  return `${label}: ${value} (school default)`;
}

export function StaffCompensationProfileFields({
  userId,
  defaults,
  draft,
  onChange,
  disabled = false,
  fieldGroupClassName = styles.fieldGroup,
  labelClassName = styles.label,
  inputClassName = styles.input,
}: StaffCompensationProfileFieldsProps) {
  const effective = resolveStaffCompensation(defaults, { ...draft, userId });
  const effectiveMode = draft.mode ?? null;
  const effectiveFrequency = draft.payFrequency ?? null;
  const showLessonRate =
    (effectiveMode ?? defaults.defaultMode) === 'per_lesson' ||
    (effectiveMode ?? defaults.defaultMode) === 'mixed';
  const showSalary =
    (effectiveMode ?? defaults.defaultMode) === 'salary' ||
    (effectiveMode ?? defaults.defaultMode) === 'mixed';
  const payFrequency = effectiveFrequency ?? defaults.defaultPayFrequency;

  const patch = (next: Partial<StaffCompensationProfileDto>) =>
    onChange({ ...draft, userId, ...next });

  return (
    <div className={styles.compensationSections}>
      <section className={styles.compensationSection}>
        <header className={styles.compensationSectionHeader}>
          <span className={styles.compensationSectionIcon} aria-hidden>
            <Coins size={16} />
          </span>
          <div>
            <h4 className={styles.compensationSectionTitle}>Pay structure</h4>
            <p className={styles.compensationSectionText}>
              How lessons and salary accrue for {staffCompensationModeLabel(effective.mode)} mode.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="staff-profile-mode">
              Compensation mode
            </label>
            <Field
              as="select"
              id="staff-profile-mode"
              className={inputClassName}
              value={draft.mode ?? ''}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  mode: event.target.value
                    ? (event.target.value as StaffCompensationModeDto)
                    : null,
                })
              }
            >
              <option value="">
                {inheritHint('Mode', staffCompensationModeLabel(defaults.defaultMode))}
              </option>
              {STAFF_COMPENSATION_MODE_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {staffCompensationModeLabel(mode)}
                </option>
              ))}
            </Field>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="staff-profile-currency">
              Currency
            </label>
            <Field
              as="select"
              id="staff-profile-currency"
              className={inputClassName}
              value={draft.currency ?? ''}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  currency: event.target.value
                    ? (event.target.value as PaymentCurrencyCode)
                    : null,
                })
              }
            >
              <option value="">{inheritHint('Currency', defaults.defaultCurrency)}</option>
              {STAFF_PAYOUT_CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Field>
          </div>

          {showLessonRate ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="staff-profile-lesson-rate">
                Per-lesson rate
              </label>
              <Field
                id="staff-profile-lesson-rate"
                type="number"
                className={inputClassName}
                min={0}
                step="0.01"
                disabled={disabled}
                placeholder={minorToMajorInput(defaults.defaultPerLessonRateMinor)}
                value={
                  draft.perLessonRateMinor != null
                    ? minorToMajorInput(draft.perLessonRateMinor)
                    : ''
                }
                onChange={(event) =>
                  patch({
                    perLessonRateMinor:
                      event.target.value.trim() === ''
                        ? null
                        : majorInputToMinor(event.target.value),
                  })
                }
              />
            </div>
          ) : null}

          {showSalary ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="staff-profile-salary">
                Salary ({staffPayFrequencyLabel(payFrequency)})
              </label>
              <Field
                id="staff-profile-salary"
                type="number"
                className={inputClassName}
                min={0}
                step="0.01"
                disabled={disabled}
                placeholder={minorToMajorInput(defaults.defaultSalaryMinor)}
                value={draft.salaryMinor != null ? minorToMajorInput(draft.salaryMinor) : ''}
                onChange={(event) =>
                  patch({
                    salaryMinor:
                      event.target.value.trim() === ''
                        ? null
                        : majorInputToMinor(event.target.value),
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
            <h4 className={styles.compensationSectionTitle}>Pay schedule</h4>
            <p className={styles.compensationSectionText}>
              When outstanding balances become due for this staff member.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="staff-profile-frequency">
              Pay frequency
            </label>
            <Field
              as="select"
              id="staff-profile-frequency"
              className={inputClassName}
              value={draft.payFrequency ?? ''}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  payFrequency: event.target.value
                    ? (event.target.value as StaffPayFrequencyDto)
                    : null,
                })
              }
            >
              <option value="">
                {inheritHint('Frequency', staffPayFrequencyLabel(defaults.defaultPayFrequency))}
              </option>
              {STAFF_PAY_FREQUENCY_OPTIONS.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {staffPayFrequencyLabel(frequency)}
                </option>
              ))}
            </Field>
          </div>

          {payFrequency === 'weekly' ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="staff-profile-weekday">
                Pay day (week)
              </label>
              <Field
                as="select"
                id="staff-profile-weekday"
                className={inputClassName}
                value={draft.payDayOfWeek != null ? String(draft.payDayOfWeek) : ''}
                disabled={disabled}
                onChange={(event) =>
                  patch({
                    payDayOfWeek:
                      event.target.value === ''
                        ? null
                        : Number.parseInt(event.target.value, 10),
                  })
                }
              >
                <option value="">
                  {inheritHint(
                    'Weekday',
                    STAFF_PAY_WEEKDAY_OPTIONS.find((o) => o.value === defaults.defaultPayDayOfWeek)
                      ?.label ?? String(defaults.defaultPayDayOfWeek),
                  )}
                </option>
                {STAFF_PAY_WEEKDAY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
            </div>
          ) : (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="staff-profile-monthday">
                Pay day of month (1–28)
              </label>
              <Field
                as="select"
                id="staff-profile-monthday"
                className={inputClassName}
                value={draft.payDayOfMonth != null ? String(draft.payDayOfMonth) : ''}
                disabled={disabled}
                onChange={(event) =>
                  patch({
                    payDayOfMonth:
                      event.target.value === ''
                        ? null
                        : Number.parseInt(event.target.value, 10),
                  })
                }
              >
                <option value="">
                  {inheritHint('Day', String(defaults.defaultPayDayOfMonth))}
                </option>
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
              Extra buffer before a due payout is marked overdue on finance dashboards.
            </p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="staff-profile-grace">
              Grace days before overdue
            </label>
            <Field
              id="staff-profile-grace"
              type="number"
              className={inputClassName}
              min={0}
              disabled={disabled}
              placeholder={String(defaults.defaultGraceDays)}
              value={draft.graceDays != null ? String(draft.graceDays) : ''}
              onChange={(event) =>
                patch({
                  graceDays:
                    event.target.value.trim() === ''
                      ? null
                      : Number.parseInt(event.target.value, 10) || 0,
                })
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
