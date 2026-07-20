'use client';

import type {
  PaymentCurrencyCode,
  StaffCompensationModeDto,
  StaffPayFrequencyDto,
  StaffPayoutDefaultsDto,
} from '@pkg/types';
import { CalendarClock, Coins, ShieldCheck } from 'lucide-react';
import { Field } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
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
  const t = useCampusT();
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
            <h4 className={styles.compensationSectionTitle}>{t('system.payouts.section.payStructure.title')}</h4>
            <p className={styles.compensationSectionText}>{t('system.payouts.section.payStructure.text')}</p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-mode">
              {t('system.payouts.fields.defaultMode')}
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
                  {staffCompensationModeLabel(mode, t)}
                </option>
              ))}
            </Field>
          </div>

          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-currency">
              {t('system.payouts.currency')}
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
                {t('system.payouts.fields.defaultLessonRate')}
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
                {t('system.payouts.fields.defaultSalary', {
                  frequency: staffPayFrequencyLabel(draft.defaultPayFrequency, t),
                })}
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
            <h4 className={styles.compensationSectionTitle}>{t('system.payouts.section.schedule.title')}</h4>
            <p className={styles.compensationSectionText}>{t('system.payouts.section.schedule.text')}</p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-frequency">
              {t('system.payouts.fields.payFrequency')}
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
                  {staffPayFrequencyLabel(frequency, t)}
                </option>
              ))}
            </Field>
          </div>

          {draft.defaultPayFrequency === 'weekly' ? (
            <div className={fieldGroupClassName}>
              <label className={labelClassName} htmlFor="payout-default-weekday">
                {t('system.payouts.fields.payDayWeek')}
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
                {t('system.payouts.fields.payDayMonth')}
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
                    {t('system.payouts.fields.payDayMonthOption', { day: String(day) })}
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
            <h4 className={styles.compensationSectionTitle}>{t('system.payouts.section.overdue.title')}</h4>
            <p className={styles.compensationSectionText}>{t('system.payouts.section.overdue.text')}</p>
          </div>
        </header>
        <div className={styles.compensationSectionBody}>
          <div className={fieldGroupClassName}>
            <label className={labelClassName} htmlFor="payout-default-grace">
              {t('system.payouts.fields.graceDays')}
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
