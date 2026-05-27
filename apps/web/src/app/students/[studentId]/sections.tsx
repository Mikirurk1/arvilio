'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  LessonRecurrence,
  ManualInvoiceMethodDto,
  ManualInvoiceMethodKindDto,
  PaymentMethodKindDto,
  ScheduledLessonDto,
  StudentBillingModeDto,
  StudentLessonBalanceDto,
  StudentManualInvoiceSelectionDto,
  StudentPaymentMethodSelectionDto,
  StudentPackageOverrideDto,
} from '@pkg/types';
import { STUDENT_BILLING_MODE_OPTIONS } from '@pkg/types';
import { useBillingStore } from '../../../stores/billing-store';
import { LessonBalanceLedgerActivity } from '../../../components/billing/LessonBalanceLedgerActivity';
import { Badge, Button, EmptyStateCard, Field, SurfaceCard } from '../../../components/ui';
import { LessonsListPanel } from '../../../components/lessons/LessonsListPanel';
import { ProfileAchievementsPanel } from '../../../components/profile/ProfileAchievementsPanel';
import { StatisticsDashboard } from '../../../components/statistics';
import { useStudentLiveStats } from '../../../hooks/use-student-live-stats';
import { selectLanguagesList, useLanguagesStore } from '../../../stores/languages-store';
import { studentIdToNumericId } from '../../../lib/student-profile';
import {
  formatTimeZoneOptionLabel,
  getTimeZoneById,
  getUserAccountStatusById,
  PROFICIENCY_LEVEL,
  TIME_ZONE_ID_LIST,
  USER_ACCOUNT_STATUS_ID_LIST,
  USER_ROLE,
  isAdminOrSuper,
  type MockStudent,
  type ProficiencyLevelId,
  type UserRole,
} from '../../../mocks';
import {
  BanknoteArrowUp,
  CreditCard,
  FileText,
  PackageOpen,
  Pipette,
  Settings2,
  WalletCards,
} from 'lucide-react';
import styles from './page.module.scss';

// StudentProfileTab is extracted to `StudentProfileTab.tsx` and imported directly by `page.tsx`.

type HslColor = { h: number; s: number; l: number };

const PAYMENT_METHOD_LABELS: Record<PaymentMethodKindDto, string> = {
  manual_invoice: 'Manual invoice',
  stripe: 'Stripe',
  liqpay: 'LiqPay',
  wayforpay: 'WayForPay',
  lemonsqueezy: 'Lemon Squeezy',
  paddle: 'Paddle',
  monopay: 'MonoPay',
  paypal: 'PayPal',
};

const MANUAL_METHOD_KIND_LABELS: Record<ManualInvoiceMethodKindDto, string> = {
  iban_sepa: 'IBAN / SEPA',
  swift_wire: 'SWIFT wire',
  card_transfer: 'Card transfer',
  custom: 'Manual invoice',
};

function getManualMethodSummary(method: ManualInvoiceMethodDto): string {
  if (method.kind === 'iban_sepa') {
    return [method.bankName, method.bankCountry, method.iban].filter(Boolean).join(' · ') || 'IBAN / SEPA';
  }
  if (method.kind === 'swift_wire') {
    return [method.bankName, method.swiftBic, method.iban ?? method.accountNumber].filter(Boolean).join(' · ') || 'SWIFT wire';
  }
  if (method.kind === 'card_transfer') {
    return [method.bankName, method.cardNumber].filter(Boolean).join(' · ') || 'Card transfer';
  }
  return method.label.trim() || 'Manual invoice';
}

function isManualMethodReadyForStudent(method: ManualInvoiceMethodDto): boolean {
  if (!method.id.trim() || !method.label.trim()) return false;
  if (method.kind === 'iban_sepa') {
    return Boolean(method.beneficiaryName.trim() && method.iban.trim());
  }
  if (method.kind === 'swift_wire') {
    return Boolean(
      method.beneficiaryName.trim() &&
        (method.accountNumber.trim() || method.iban?.trim()) &&
        method.swiftBic.trim(),
    );
  }
  if (method.kind === 'card_transfer') {
    return Boolean(
      method.beneficiaryName.trim() && method.bankName.trim() && method.cardNumber.trim(),
    );
  }
  return Boolean(method.instructionsUk.trim());
}

function getFeaturedPackageId(
  packages: Array<{ id: string; lessons: number }>,
): string | null {
  if (packages.length === 0) return null;
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  return sorted[Math.floor(sorted.length / 2)]?.id ?? null;
}

function getPackageTone(
  packages: Array<{ id: string; lessons: number }>,
  packageId: string,
): 'starter' | 'popular' | 'premium' {
  const sorted = [...packages].sort((a, b) => a.lessons - b.lessons);
  if (sorted.length <= 1) return 'popular';
  if (sorted[0]?.id === packageId) return 'starter';
  if (sorted[sorted.length - 1]?.id === packageId) return 'premium';
  return 'popular';
}

function BillingSectionHeader({
  icon,
  eyebrow,
  title,
  description,
  aside,
}: {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <div className={styles.billingSectionHead}>
      <div className={styles.billingSectionHeadMain}>
        <div className={styles.billingSectionHeadIcon}>{icon}</div>
        <div className={styles.billingSectionHeadCopy}>
          {eyebrow ? <div className={styles.billingSectionEyebrow}>{eyebrow}</div> : null}
          <h4 className={styles.billingSectionTitle}>{title}</h4>
          <p className={styles.billingSectionDescription}>{description}</p>
        </div>
      </div>
      {aside ? <div className={styles.billingSectionHeadAside}>{aside}</div> : null}
    </div>
  );
}

function BillingRuleCard({
  icon,
  title,
  description,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.billingRuleCard}>
      <div className={styles.billingRuleCardHead}>
        <div className={styles.billingRuleCardTitleRow}>
          <div className={styles.billingRuleCardIcon}>{icon}</div>
          <div className={styles.billingRuleCardCopy}>
            <h5 className={styles.billingRuleCardTitle}>{title}</h5>
            <p className={styles.billingRuleCardDescription}>{description}</p>
          </div>
        </div>
        {badge ? <div className={styles.billingRuleCardBadge}>{badge}</div> : null}
      </div>
      <div className={styles.billingRuleCardBody}>{children}</div>
    </div>
  );
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampHue(value: number): number {
  const mod = value % 360;
  return mod < 0 ? mod + 360 : mod;
}

function hexToHsl(hex: string): HslColor | null {
  const normalized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  if (delta === 0) return { h: 0, s: 0, l };
  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = ((g - b) / delta) % 6;
  else if (max === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  return { h: clampHue(h * 60), s: clamp01(s), l: clamp01(l) };
}

function hslToHex(color: HslColor): string {
  const h = clampHue(color.h);
  const s = clamp01(color.s);
  const l = clamp01(color.l);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function UserColorPicker({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (nextHex: string) => void;
}) {
  const [hsl, setHsl] = useState<HslColor>(() => hexToHsl(value) ?? { h: 210, s: 0.54, l: 0.5 });
  const [open, setOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const applyHsl = (next: HslColor) => {
    setHsl(next);
    onChange(hslToHex(next));
  };

  const updateFromPalettePointer = (clientX: number, clientY: number) => {
    const rect = paletteRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp01((clientX - rect.left) / rect.width);
    const l = clamp01(1 - (clientY - rect.top) / rect.height);
    applyHsl({ ...hsl, s, l });
  };

  const startPaletteDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    updateFromPalettePointer(event.clientX, event.clientY);
  };

  return (
    <div className={styles.colorPicker}>
      <div className={styles.colorControlsRowCompact}>
        <div className={styles.colorSwatch} style={{ backgroundColor: hslToHex(hsl) }} />
        <Field
          type="text"
          className={styles.input}
          value={value}
          readOnly={disabled}
          placeholder="#3b82c4"
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            const parsed = hexToHsl(next);
            if (parsed) setHsl(parsed);
          }}
        />
        <Button type="button" className={styles.colorPickerToggleBtn} disabled={disabled} onClick={() => setOpen((v) => !v)}>
          <Pipette size={16} aria-hidden />
        </Button>
      </div>
      {open ? (
        <>
          <div
            ref={paletteRef}
            className={`${styles.colorPalette} ${disabled ? styles.colorPaletteDisabled : ''}`}
            style={{ backgroundColor: `hsl(${hsl.h} 100% 50%)` }}
            onPointerDown={startPaletteDrag}
            onPointerMove={(event) => {
              if (!disabled && event.buttons === 1) updateFromPalettePointer(event.clientX, event.clientY);
            }}
          >
            <span
              className={styles.colorPickerThumb}
              style={{ left: `${hsl.s * 100}%`, top: `${(1 - hsl.l) * 100}%` }}
            />
          </div>
          <div className={styles.colorControlsRow}>
            <input
              type="range"
              min={0}
              max={360}
              value={Math.round(hsl.h)}
              disabled={disabled}
              className={styles.colorHueSlider}
              onChange={(event) => applyHsl({ ...hsl, h: Number(event.target.value) })}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

export function StudentProfileTab({
  student,
  onChange,
  canEdit,
  viewerRole,
  teacherBackendId,
  teacherOptions,
  onTeacherBackendIdChange,
  saved = false,
  saveError = null,
  onSave,
  showNativeLanguage = false,
  nativeLanguageId = '',
  onNativeLanguageIdChange,
}: {
  student: MockStudent;
  onChange: (next: MockStudent) => void;
  canEdit: boolean;
  viewerRole: UserRole;
  teacherBackendId: string | null;
  teacherOptions: Array<{ id: string; displayName: string }>;
  onTeacherBackendIdChange: (teacherId: string | null) => void;
  saved?: boolean;
  saveError?: string | null;
  onSave: () => void;
  showNativeLanguage?: boolean;
  nativeLanguageId?: string;
  onNativeLanguageIdChange?: (languageId: string) => void;
}) {
  const languages = useLanguagesStore(selectLanguagesList);
  const fetchLanguages = useLanguagesStore((s) => s.fetchLanguages);
  const isStudentViewer = viewerRole === USER_ROLE.student.id;
  const isTeacherViewer = viewerRole === USER_ROLE.teacher.id;
  const canAssignTeacher = isAdminOrSuper(viewerRole);
  const canManageUserColor =
    !isStudentViewer &&
    (isTeacherViewer || canAssignTeacher);

  useEffect(() => {
    if (showNativeLanguage) void fetchLanguages();
  }, [fetchLanguages, showNativeLanguage]);
  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.tabIntro}>
        Manage core student profile settings, contacts, native language, timezone, and user color.
      </p>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full name</label>
          <Field className={styles.input} value={student.fullName} readOnly={!canEdit} onChange={(e) => onChange({ ...student, fullName: e.target.value })} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <Field className={styles.input} value={student.email} readOnly={!canEdit} onChange={(e) => onChange({ ...student, email: e.target.value })} />
        </div>
        {!isStudentViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Level</label>
            <Field as="select"
              className={styles.input}
              value={String(student.proficiencyLevelId)}
              readOnly={!canEdit}
              onChange={(e) =>
                onChange({
                  ...student,
                  proficiencyLevelId: Number(e.target.value) as ProficiencyLevelId,
                })
              }
            >
              {(Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]).map((key) => {
                const L = PROFICIENCY_LEVEL[key];
                return (
                  <option key={L.id} value={L.id}>
                    {L.code} — {L.label}
                  </option>
                );
              })}
            </Field>
          </div>
        ) : null}
        {!isTeacherViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone</label>
            <Field className={styles.input} value={student.phone} readOnly={!canEdit} onChange={(e) => onChange({ ...student, phone: e.target.value })} />
          </div>
        ) : null}
        {showNativeLanguage && onNativeLanguageIdChange ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Native language</label>
            <Field as="select"
              className={styles.input}
              value={nativeLanguageId}
              readOnly={!canEdit}
              onChange={(e) => onNativeLanguageIdChange(e.target.value)}
            >
              <option value="">—</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </Field>
          </div>
        ) : null}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Timezone</label>
          <Field as="select"
            className={styles.input}
            value={String(student.timezoneId)}
            readOnly={!canEdit}
            onChange={(e) =>
              onChange({ ...student, timezoneId: Number(e.target.value) as MockStudent['timezoneId'] })
            }
          >
            {TIME_ZONE_ID_LIST.map((id) => {
              const tz = getTimeZoneById(id);
              return tz ? (
                <option key={id} value={id}>
                  {formatTimeZoneOptionLabel(tz)}
                </option>
              ) : null;
            })}
          </Field>
        </div>
        {!isStudentViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Status</label>
            <Field as="select"
              className={styles.input}
              value={String(student.statusId)}
              readOnly={!canEdit}
              onChange={(e) =>
                onChange({
                  ...student,
                  statusId: Number(e.target.value) as MockStudent['statusId'],
                })
              }
            >
              {USER_ACCOUNT_STATUS_ID_LIST.map((id) => {
                const s = getUserAccountStatusById(id);
                return s ? (
                  <option key={id} value={id}>
                    {s.name}
                  </option>
                ) : null;
              })}
            </Field>
          </div>
        ) : null}
        {canAssignTeacher ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Assigned teacher</label>
            <Field as="select"
              className={styles.input}
              value={teacherBackendId ?? ''}
              readOnly={!canEdit}
              onChange={(e) =>
                onTeacherBackendIdChange(e.target.value ? e.target.value : null)
              }
            >
              <option value="">— No teacher —</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.displayName}
                </option>
              ))}
            </Field>
          </div>
        ) : !isStudentViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Teacher</label>
            <Field className={styles.input} value={student.teacherName || '—'} readOnly />
          </div>
        ) : null}
        {!isStudentViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Schedule type</label>
            <Field as="select"
              className={styles.input}
              value={String(student.scheduleType)}
              readOnly={!canEdit}
              onChange={(e) =>
                onChange({ ...student, scheduleType: e.target.value === 'true' })
              }
            >
              <option value="true">Fixed schedule</option>
              <option value="false">Flexible schedule</option>
            </Field>
          </div>
        ) : null}
        {canManageUserColor ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>User color</label>
            <p className={styles.colorFieldHint}>Shown on the calendar for this student.</p>
            <UserColorPicker
              value={student.color ?? ''}
              disabled={!canEdit}
              onChange={(nextHex) => onChange({ ...student, color: nextHex })}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.actions}>
        {saveError ? <span className={styles.errorHint}>{saveError}</span> : null}
        {saved ? <span className={styles.savedHint}>Saved</span> : null}
        <Button type="button" className={styles.primaryBtn} disabled={!canEdit} onClick={onSave}>
          Save student data
        </Button>
      </div>
    </SurfaceCard>
  );
}

export function StudentBillingTab({
  studentBackendId,
  canAdjust,
  isAdmin,
}: {
  studentBackendId: string;
  canAdjust: boolean;
  isAdmin: boolean;
}) {
  type PendingAction = 'billingRules' | 'pricing' | 'manualCredit' | null;
  type FeedbackState = {
    action: Exclude<PendingAction, null>;
    kind: 'success' | 'error';
    text: string;
  } | null;

  const fetchStudentBalance = useBillingStore((s) => s.fetchStudentBalance);
  const adjustStudentBalance = useBillingStore((s) => s.adjustStudentBalance);
  const updateStudentLessonPricing = useBillingStore((s) => s.updateStudentLessonPricing);
  const updateStudentLessonBilling = useBillingStore((s) => s.updateStudentLessonBilling);
  const [balance, setBalance] = useState<StudentLessonBalanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonsToAdd, setLessonsToAdd] = useState('1');
  const [note, setNote] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [priceOverride, setPriceOverride] = useState('');
  const [billingMode, setBillingMode] = useState<StudentBillingModeDto>('both');
  const [packageOverrides, setPackageOverrides] = useState<StudentPackageOverrideDto[]>([]);
  const [paymentMethodSelection, setPaymentMethodSelection] = useState<StudentPaymentMethodSelectionDto>({
    allowedMethods: [],
  });
  const [manualInvoiceSelection, setManualInvoiceSelection] = useState<StudentManualInvoiceSelectionDto>({
    allowedMethodIds: [],
    defaultMethodId: null,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudentBalance(studentBackendId);
      setBalance(data);
      setPriceOverride(
        data.pricePerLessonMinor != null ? String(data.pricePerLessonMinor) : '',
      );
      setBillingMode(data.billingMode);
      setPackageOverrides(data.packageOverrides);
      setPaymentMethodSelection(data.paymentMethodSelection);
      setManualInvoiceSelection(data.manualInvoiceSelection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [studentBackendId]);

  const enabledMethods = balance?.enabledPaymentMethods ?? [];
  const isBusy = pendingAction !== null;

  const onAdjust = async () => {
    const lessons = Number.parseInt(lessonsToAdd, 10);
    if (!Number.isFinite(lessons) || lessons <= 0) return;
    setPendingAction('manualCredit');
    setError(null);
    setFeedback(null);
    try {
      const data = await adjustStudentBalance({
        studentId: studentBackendId,
        lessons,
        note: note.trim() || null,
      });
      setBalance(data);
      setNote('');
      setFeedback({ action: 'manualCredit', kind: 'success', text: 'Lessons credited.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adjust failed');
      setFeedback({
        action: 'manualCredit',
        kind: 'error',
        text: err instanceof Error ? err.message : 'Adjust failed',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const minPackageLessons = balance?.minPackageLessons ?? 1;

  const updatePackageOverride = (
    packageId: string,
    patch: Partial<StudentPackageOverrideDto>,
  ) => {
    setPackageOverrides((rows) =>
      rows.map((row) => (row.packageId === packageId ? { ...row, ...patch } : row)),
    );
  };

  const toggleManualMethod = (methodId: string, checked: boolean) => {
    setManualInvoiceSelection((current) => {
      const effectiveIds =
        current.allowedMethodIds.length > 0
          ? current.allowedMethodIds
          : platformManualInvoiceMethods.map((method) => method.id);
      if (!checked && effectiveIds.length === 1 && effectiveIds[0] === methodId) {
        return current;
      }
      const allowedMethodIds = checked
        ? [...new Set([...effectiveIds, methodId])]
        : effectiveIds.filter((id) => id !== methodId);
      return {
        allowedMethodIds,
        defaultMethodId:
          !checked && current.defaultMethodId === methodId ? null : current.defaultMethodId,
      };
    });
  };

  const setRecommendedManualMethod = (methodId: string | null) => {
    setManualInvoiceSelection((current) => ({
      ...current,
      defaultMethodId: methodId,
    }));
  };

  const togglePaymentMethod = (method: PaymentMethodKindDto, checked: boolean) => {
    setPaymentMethodSelection((current) => {
      const effectiveMethods =
        current.allowedMethods.length > 0 ? current.allowedMethods : enabledMethods;
      if (!checked && effectiveMethods.length === 1 && effectiveMethods[0] === method) {
        return current;
      }
      const allowedMethods = checked
        ? [...new Set([...effectiveMethods, method])]
        : effectiveMethods.filter((value) => value !== method);
      return { allowedMethods };
    });
  };

  const onSaveBillingRules = async () => {
    if (!isAdmin) return;
    if (manualInvoiceEnabledForStudent && platformManualInvoiceMethods.length > 0 && selectedManualMethodIds.length === 0) {
      setFeedback({
        action: 'billingRules',
        kind: 'error',
        text: 'Select at least one manual invoice template for Manual invoice.',
      });
      return;
    }
    setPendingAction('billingRules');
    setError(null);
    setFeedback(null);
    try {
      const data = await updateStudentLessonBilling({
        studentId: studentBackendId,
        billingMode,
        packageOverrides,
        paymentMethodSelection: {
          allowedMethods:
            selectedPaymentMethodIds.length === enabledMethods.length
              ? []
              : selectedPaymentMethodIds,
          restrictToAllowlistOnly:
            selectedPaymentMethodIds.length > 0 &&
            selectedPaymentMethodIds.length < enabledMethods.length,
        },
        manualInvoiceSelection: {
          allowedMethodIds: manualInvoiceSelection.allowedMethodIds,
          defaultMethodId: manualInvoiceSelection.defaultMethodId,
        },
      });
      setBalance(data);
      setBillingMode(data.billingMode);
      setPackageOverrides(data.packageOverrides);
      setPaymentMethodSelection(data.paymentMethodSelection);
      setManualInvoiceSelection(data.manualInvoiceSelection);
      setFeedback({
        action: 'billingRules',
        kind: 'success',
        text: 'Billing rules saved.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save billing rules failed');
      setFeedback({
        action: 'billingRules',
        kind: 'error',
        text: err instanceof Error ? err.message : 'Save billing rules failed',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const onSavePricing = async () => {
    if (!isAdmin) return;
    setPendingAction('pricing');
    setError(null);
    setFeedback(null);
    try {
      const trimmed = priceOverride.trim();
      const pricePerLessonMinor =
        trimmed === '' ? null : Math.max(0, Number.parseInt(trimmed, 10));
      if (trimmed !== '' && !Number.isFinite(pricePerLessonMinor)) {
        setError('Enter a valid price per lesson (minor units) or leave empty for default');
        setFeedback({
          action: 'pricing',
          kind: 'error',
          text: 'Enter a valid price per lesson or leave the field empty.',
        });
        return;
      }
      const data = await updateStudentLessonPricing({
        studentId: studentBackendId,
        pricePerLessonMinor,
      });
      setBalance(data);
      setPriceOverride(
        data.pricePerLessonMinor != null ? String(data.pricePerLessonMinor) : '',
      );
      setFeedback({ action: 'pricing', kind: 'success', text: 'Pricing saved.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save pricing failed');
      setFeedback({
        action: 'pricing',
        kind: 'error',
        text: err instanceof Error ? err.message : 'Save pricing failed',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const formatMinor = (minor: number, cur: string) => `${(minor / 100).toFixed(2)} ${cur}`;
  const activeBillingMode =
    STUDENT_BILLING_MODE_OPTIONS.find((o) => o.value === (balance?.billingMode ?? billingMode)) ??
    STUDENT_BILLING_MODE_OPTIONS[2];
  const enabledPackageCount = packageOverrides.filter((row) => row.enabled).length;
  const lockedPackageCount = packageOverrides.filter((row) => row.lessonsLocked).length;
  const featuredStudentPackageId = getFeaturedPackageId(balance?.packages ?? []);
  const platformManualInvoiceMethods = balance?.platformManualInvoiceMethods ?? [];
  const selectedPaymentMethodIds =
    paymentMethodSelection.allowedMethods.length > 0
      ? paymentMethodSelection.allowedMethods
      : enabledMethods;
  const manualInvoiceAllowedByPlatform = enabledMethods.includes('manual_invoice');
  const manualInvoiceEnabledForStudent =
    manualInvoiceAllowedByPlatform && selectedPaymentMethodIds.includes('manual_invoice');
  const selectedManualMethodIds =
    manualInvoiceSelection.allowedMethodIds.length > 0
      ? manualInvoiceSelection.allowedMethodIds
      : platformManualInvoiceMethods.map((method) => method.id);
  const selectedManualMethodCount = selectedManualMethodIds.length;
  const manualMethodsForSelection = platformManualInvoiceMethods.filter((method) =>
    selectedManualMethodIds.includes(method.id),
  );
  const shouldShowRecommendedManualTemplate = manualMethodsForSelection.length > 1;
  const manualInvoiceDefaultLabel =
    shouldShowRecommendedManualTemplate
      ? platformManualInvoiceMethods.find(
      (method) => method.id === manualInvoiceSelection.defaultMethodId,
        )?.label ?? null
      : null;

  if (loading) {
    return (
      <SurfaceCard className={styles.tabCard}>
        <p className={styles.tabIntro}>Loading billing…</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className={styles.tabCard}>
      <div className={styles.billingWorkspaceHero}>
        <div className={styles.billingWorkspaceHeroMain}>
          <div className={styles.billingWorkspaceHeroIcon}>
            <WalletCards size={20} aria-hidden />
          </div>
          <div>
            <div className={styles.billingWorkspaceEyebrow}>Student details → Billing</div>
            <h3 className={styles.billingWorkspaceTitle}>Billing workspace</h3>
            <p className={styles.billingWorkspaceText}>
              Manage how the student pays, which package options they see, and how offline invoice
              payments are credited into lesson balance.
            </p>
          </div>
        </div>
        <div className={styles.billingWorkspaceTags}>
          <span className={styles.billingWorkspaceTag}>Rules</span>
          <span className={styles.billingWorkspaceTag}>Pricing</span>
          <span className={styles.billingWorkspaceTag}>Packages</span>
          <span className={styles.billingWorkspaceTag}>Manual credits</span>
        </div>
      </div>
      {error ? <span className={styles.errorHint}>{error}</span> : null}
      {balance ? (
        <>
          <div className={styles.billingSummaryGrid}>
            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}>
                <WalletCards size={18} aria-hidden />
              </div>
              <div className={styles.billingSummaryLabel}>Lesson balance</div>
              <div className={styles.billingSummaryValue}>
                {balance.balance}
                {balance.isDebt ? ' · debt' : ''}
              </div>
              <div className={styles.billingSummaryHint}>
                Manual credits and lesson consumption change this number.
              </div>
            </div>

            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}>
                <PackageOpen size={18} aria-hidden />
              </div>
              <div className={styles.billingSummaryLabel}>Billing mode</div>
              <div className={styles.billingSummaryValue}>{activeBillingMode.label}</div>
              <div className={styles.billingSummaryHint}>{activeBillingMode.description}</div>
            </div>

            {balance.showPerLessonPricing ? (
              <div className={styles.billingSummaryCard}>
                <div className={styles.billingSummaryIcon}>
                  <BanknoteArrowUp size={18} aria-hidden />
                </div>
                <div className={styles.billingSummaryLabel}>Price per lesson</div>
                <div className={styles.billingSummaryValue}>
                  {formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)}
                </div>
                <div className={styles.billingSummaryHint}>
                  {balance.isCustomPrice ? 'Custom student rate' : 'Platform default rate'}
                </div>
              </div>
            ) : null}

            <div className={styles.billingSummaryCard}>
              <div className={styles.billingSummaryIcon}>
                <CreditCard size={18} aria-hidden />
              </div>
              <div className={styles.billingSummaryLabel}>Self-serve packages</div>
              <div className={styles.billingSummaryValue}>
                {balance.showSelfServePackages ? `${balance.packages.length} active` : 'Hidden'}
              </div>
              <div className={styles.billingSummaryHint}>
                Min package size: {balance.minPackageLessons} lessons
              </div>
            </div>
          </div>

          {isAdmin ? (
            <section className={styles.billingSectionCard}>
              <BillingSectionHeader
                icon={<Settings2 size={18} aria-hidden />}
                eyebrow="Core setup"
                title="Billing rules"
                description="This section controls how the student is billed, which payment methods are visible, and which manual invoice templates can be used."
                aside={
                  <Button
                    type="button"
                    loading={pendingAction === 'billingRules'}
                    loadingLabel="Saving…"
                    disabled={isBusy}
                    onClick={() => void onSaveBillingRules()}
                  >
                    Save billing rules
                  </Button>
                }
              />
              {feedback?.action === 'billingRules' ? (
                <p
                  className={
                    feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError
                  }
                >
                  {feedback.text}
                </p>
              ) : null}

              <div className={styles.billingRuleStack}>
                <BillingRuleCard
                  icon={<WalletCards size={18} aria-hidden />}
                  title="How the student is billed"
                  description="Pick the main charging model first. This controls whether self-serve packages and per-lesson pricing are visible."
                >
                  <div className={styles.billingModeGrid}>
                    {STUDENT_BILLING_MODE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`${styles.billingModeCard} ${
                          billingMode === opt.value ? styles.billingModeCardActive : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="student-billing-mode"
                          checked={billingMode === opt.value}
                          onChange={() => setBillingMode(opt.value)}
                        />
                        <span className={styles.billingModeTitle}>{opt.label}</span>
                        <span className={styles.billingModeDesc}>{opt.description}</span>
                      </label>
                    ))}
                  </div>
                </BillingRuleCard>

                <BillingRuleCard
                  icon={<CreditCard size={18} aria-hidden />}
                  title="Allowed payment methods"
                  description="Choose one or many top-level payment methods for this student, or leave the restriction off to use everything enabled platform-wide."
                  badge={
                    <Badge variant="neutral" size="sm">
                      {enabledMethods.length} enabled platform-wide
                    </Badge>
                  }
                >
                  {enabledMethods.length === 0 ? (
                    <p className={styles.colorFieldHint}>
                      No payment methods are enabled yet in System → Payments.
                    </p>
                  ) : (
                    <>
                      <p className={styles.billingHelperText}>
                        Choose one or several payment methods for this student. If all methods stay
                        selected, the student keeps access to every platform-enabled payment method.
                      </p>

                      <div className={styles.paymentMethodStudentGrid}>
                        {enabledMethods.map((method) => {
                          const isAllowed = selectedPaymentMethodIds.includes(method);
                          return (
                            <label
                              key={method}
                              className={`${styles.paymentMethodStudentCard} ${
                                isAllowed ? styles.paymentMethodStudentCardActive : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={(e) => togglePaymentMethod(method, e.target.checked)}
                              />
                              <div className={styles.paymentMethodStudentMeta}>
                                <div className={styles.paymentMethodStudentTitle}>
                                  {PAYMENT_METHOD_LABELS[method]}
                                </div>
                                <div className={styles.paymentMethodStudentSummary}>
                                  {method === 'manual_invoice'
                                    ? 'Offline bank transfer instructions configured in System → Payments.'
                                    : 'Available for this student at checkout when enabled.'}
                                </div>
                              {method === 'manual_invoice' && isAllowed ? (
                                <div className={styles.paymentMethodStudentExtra}>
                                  <div className={styles.paymentMethodStudentBadges}>
                                    <Badge variant="neutral" size="sm">
                                      {platformManualInvoiceMethods.length === 0
                                        ? 'No templates configured'
                                        : selectedManualMethodCount === platformManualInvoiceMethods.length
                                          ? `All ${platformManualInvoiceMethods.length} templates available`
                                          : `${selectedManualMethodCount} of ${platformManualInvoiceMethods.length} templates selected`}
                                    </Badge>
                                    {shouldShowRecommendedManualTemplate && manualInvoiceDefaultLabel ? (
                                      <Badge variant="blue" size="sm">
                                        Default: {manualInvoiceDefaultLabel}
                                      </Badge>
                                    ) : null}
                                  </div>
                                  <div className={styles.paymentMethodStudentHint}>
                                    Choose one or several concrete invoice templates right here.
                                  </div>
                                  {platformManualInvoiceMethods.length === 0 ? (
                                    <div className={styles.manualInvoiceInlineEmpty}>
                                      No manual invoice templates are created yet in System →
                                      Payments.
                                    </div>
                                  ) : (
                                    <div className={styles.manualInvoiceInlinePanel}>
                                      <p className={styles.billingHelperText}>
                                        Choose one or several templates for this student. Only fully
                                        filled templates are shown to the student on the payment
                                        page.
                                      </p>

                                      <div className={styles.manualInvoiceInlineGrid}>
                                        {platformManualInvoiceMethods.map((manualMethod) => {
                                          const manualIsAllowed =
                                            selectedManualMethodIds.includes(manualMethod.id);
                                          const isRecommended =
                                            manualInvoiceSelection.defaultMethodId === manualMethod.id;
                                          const isReady = isManualMethodReadyForStudent(manualMethod);
                                          return (
                                            <div
                                              key={manualMethod.id}
                                              className={`${styles.manualInvoiceInlineCard} ${
                                                manualIsAllowed
                                                  ? styles.manualInvoiceInlineCardActive
                                                  : ''
                                              }`}
                                            >
                                              <label className={styles.manualInvoiceInlineMain}>
                                                <input
                                                  type="checkbox"
                                                  checked={manualIsAllowed}
                                                  onChange={(e) =>
                                                    toggleManualMethod(
                                                      manualMethod.id,
                                                      e.target.checked,
                                                    )
                                                  }
                                                />
                                                <div className={styles.manualInvoiceInlineMeta}>
                                                  <div className={styles.manualInvoiceInlineTitleRow}>
                                                    <div
                                                      className={styles.manualInvoiceInlineTitle}
                                                    >
                                                      {manualMethod.label}
                                                    </div>
                                                    <div
                                                      className={styles.manualInvoiceInlineBadges}
                                                    >
                                                      <Badge variant="neutral" size="sm">
                                                        {
                                                          MANUAL_METHOD_KIND_LABELS[
                                                            manualMethod.kind
                                                          ]
                                                        }
                                                      </Badge>
                                                      {!isReady ? (
                                                        <Badge variant="neutral" size="sm">
                                                          Incomplete
                                                        </Badge>
                                                      ) : null}
                                                      {isRecommended ? (
                                                        <Badge variant="blue" size="sm">
                                                          Recommended
                                                        </Badge>
                                                      ) : null}
                                                    </div>
                                                  </div>
                                                  <div
                                                    className={styles.manualInvoiceInlineSummary}
                                                  >
                                                    {getManualMethodSummary(manualMethod)}
                                                  </div>
                                                </div>
                                              </label>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {shouldShowRecommendedManualTemplate ? (
                                        <div className={styles.manualInvoiceInlineFooter}>
                                          <div className={styles.fieldGroup}>
                                            <label className={styles.label}>Recommended template</label>
                                            <Field
                                              as="select"
                                              className={styles.input}
                                              value={manualInvoiceSelection.defaultMethodId ?? ''}
                                              onChange={(e) =>
                                                setRecommendedManualMethod(
                                                  e.target.value || null,
                                                )
                                              }
                                            >
                                              <option value="">No recommended template</option>
                                              {manualMethodsForSelection.map((manualMethod) => (
                                                <option
                                                  key={manualMethod.id}
                                                  value={manualMethod.id}
                                                >
                                                  {manualMethod.label}
                                                </option>
                                              ))}
                                            </Field>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </div>
                              ) : null}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  )}
                </BillingRuleCard>

              </div>
            </section>
          ) : null}

          {isAdmin && (billingMode === 'packages' || billingMode === 'both') ? (
            <section className={styles.billingSectionCard}>
              <BillingSectionHeader
                icon={<PackageOpen size={18} aria-hidden />}
                eyebrow="Checkout packages"
                title="Package rules for this student"
                description="Packages are predefined lesson bundles. You can hide a package, change its lesson count, or lock the size for this student."
              />

              {packageOverrides.length === 0 ? (
                <p className={styles.colorFieldHint}>
                  No platform packages configured. Add them in System → Payments first.
                </p>
              ) : (
                <div className={styles.billingPackageRulesBody}>
                  <div className={styles.billingPackageStats}>
                    <div className={styles.billingPackageStat}>
                      <span className={styles.billingPackageStatLabel}>Visible packages</span>
                      <strong>{enabledPackageCount}</strong>
                    </div>
                    <div className={styles.billingPackageStat}>
                      <span className={styles.billingPackageStatLabel}>Locked packages</span>
                      <strong>{lockedPackageCount}</strong>
                    </div>
                    <div className={styles.billingPackageStat}>
                      <span className={styles.billingPackageStatLabel}>Min size</span>
                      <strong>{minPackageLessons} lessons</strong>
                    </div>
                  </div>

                  <div className={styles.billingPackageList}>
                  {packageOverrides.map((ov) => {
                    const platform = balance.platformPackages.find((p) => p.id === ov.packageId);
                    const resolved = balance.packages.find((p) => p.id === ov.packageId);
                    const lessons = ov.lessons ?? platform?.lessons ?? minPackageLessons;
                    const amountMinor =
                      resolved?.amountMinor ?? lessons * balance.resolvedPricePerLessonMinor;
                    const tone = getPackageTone(
                      packageOverrides.map((row) => ({
                        id: row.packageId,
                        lessons:
                          row.lessons ??
                          balance.platformPackages.find((p) => p.id === row.packageId)?.lessons ??
                          minPackageLessons,
                      })),
                      ov.packageId,
                    );

                    return (
                      <div
                        key={ov.packageId}
                        className={`${styles.billingPackageCard} ${
                          tone === 'starter' ? styles.billingPackageCardStarter : ''
                        } ${tone === 'popular' ? styles.billingPackageCardPopular : ''} ${
                          tone === 'premium' ? styles.billingPackageCardPremium : ''
                        }`}
                      >
                        <div className={styles.billingPackageAccent} />
                        <div className={styles.billingPackageMeta}>
                          <div className={styles.billingPackageTitleWrap}>
                            <div className={styles.billingPackageEyebrow}>
                              {tone === 'starter'
                                ? 'Starter'
                                : tone === 'premium'
                                  ? 'Premium'
                                  : 'Popular choice'}
                            </div>
                            <div className={styles.billingPackageTitle}>
                              {platform?.label ?? ov.packageId}
                            </div>
                            <div className={styles.billingPackageBadges}>
                              <Badge variant={ov.enabled ? 'green' : 'neutral'} size="sm">
                                {ov.enabled ? 'Visible' : 'Hidden'}
                              </Badge>
                              <Badge variant={ov.lessonsLocked ? 'blue' : 'neutral'} size="sm">
                                {ov.lessonsLocked ? 'Fixed size' : 'Flexible'}
                              </Badge>
                            </div>
                          </div>
                          <div className={styles.billingPackagePrice}>
                            {formatMinor(amountMinor, balance.defaultCurrency)}
                          </div>
                        </div>

                        <div className={styles.billingPackageSubmeta}>
                          <span>{lessons} lessons</span>
                          <span>
                            {formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)} per
                            lesson
                          </span>
                        </div>

                        <div className={styles.billingPackageControls}>
                          <div className={styles.billingPackageControlCell}>
                            <span className={styles.billingPackageControlLabel}>Visibility</span>
                            <label className={styles.billingPackageToggle}>
                              <input
                                type="checkbox"
                                checked={ov.enabled}
                                onChange={(e) =>
                                  updatePackageOverride(ov.packageId, { enabled: e.target.checked })
                                }
                              />
                              <span>Visible to student</span>
                            </label>
                          </div>

                          <div
                            className={`${styles.billingPackageControlCell} ${styles.billingPackageControlCellWide}`}
                          >
                            <div className={styles.billingInlineField}>
                              <span className={styles.billingInlineLabel}>Lessons in package</span>
                              <Field
                                type="number"
                                className={styles.input}
                                min={minPackageLessons}
                                disabled={ov.lessonsLocked}
                                value={String(lessons)}
                                onChange={(e) =>
                                  updatePackageOverride(ov.packageId, {
                                    lessons: Math.max(
                                      minPackageLessons,
                                      Number.parseInt(e.target.value, 10) || minPackageLessons,
                                    ),
                                  })
                                }
                              />
                              <span className={styles.billingInlineHint}>
                                {ov.lessonsLocked
                                  ? 'Size is fixed — student cannot change lesson count.'
                                  : 'Student can buy this exact package size.'}
                              </span>
                            </div>
                          </div>

                          <div className={styles.billingPackageControlCell}>
                            <span className={styles.billingPackageControlLabel}>Size rule</span>
                            <label className={styles.billingPackageToggle}>
                              <input
                                type="checkbox"
                                checked={ov.lessonsLocked}
                                onChange={(e) =>
                                  updatePackageOverride(ov.packageId, {
                                    lessonsLocked: e.target.checked,
                                    lessons:
                                      e.target.checked && ov.lessons == null ? lessons : ov.lessons,
                                  })
                                }
                              />
                              <span>Fixed for student</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              )}
            </section>
          ) : null}

          {isAdmin && balance.showPerLessonPricing ? (
            <section className={styles.billingSectionCard}>
              <BillingSectionHeader
                icon={<BanknoteArrowUp size={18} aria-hidden />}
                eyebrow="Lesson rate"
                title="Per-lesson pricing"
                description={`Leave empty to use the platform default of ${formatMinor(balance.defaultPricePerLessonMinor, balance.defaultCurrency)}.`}
                aside={
                  <Button
                    type="button"
                    loading={pendingAction === 'pricing'}
                    loadingLabel="Saving…"
                    disabled={isBusy}
                    onClick={() => void onSavePricing()}
                  >
                    Save pricing
                  </Button>
                }
              />
              {feedback?.action === 'pricing' ? (
                <p
                  className={
                    feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError
                  }
                >
                  {feedback.text}
                </p>
              ) : null}

              <div className={styles.billingNoticeCard}>
                <div className={styles.billingNoticeTitle}>Current resolved lesson price</div>
                <div className={styles.billingNoticeText}>
                  {formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)} ·{' '}
                  {balance.isCustomPrice ? 'Custom student rate' : 'Using platform default'}
                </div>
              </div>

              <div className={styles.billingSelectRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Price override</label>
                  <Field
                    type="number"
                    className={styles.input}
                    min={0}
                    placeholder={String(balance.defaultPricePerLessonMinor)}
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {!isAdmin && balance.showSelfServePackages && balance.packages.length > 0 ? (
            <section className={styles.billingSectionCard}>
              <BillingSectionHeader
                icon={<PackageOpen size={18} aria-hidden />}
                eyebrow="Student-facing"
                title="Available packages"
                description="These package sizes are currently visible to the student on the payment page."
              />

              <div className={styles.billingStudentPackageStats}>
                <div className={styles.billingPackageStat}>
                  <span className={styles.billingPackageStatLabel}>Available</span>
                  <strong>{balance.packages.length}</strong>
                </div>
                <div className={styles.billingPackageStat}>
                  <span className={styles.billingPackageStatLabel}>Starting from</span>
                  <strong>
                    {Math.min(...balance.packages.map((pkg) => pkg.lessons))} lessons
                  </strong>
                </div>
                <div className={styles.billingPackageStat}>
                  <span className={styles.billingPackageStatLabel}>Current lesson rate</span>
                  <strong>
                    {formatMinor(balance.resolvedPricePerLessonMinor, balance.defaultCurrency)}
                  </strong>
                </div>
              </div>

              <div className={styles.billingPackageList}>
                {balance.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`${styles.billingPackageCard} ${
                      pkg.id === featuredStudentPackageId ? styles.billingPackageCardFeatured : ''
                    } ${
                      getPackageTone(balance.packages, pkg.id) === 'starter'
                        ? styles.billingPackageCardStarter
                        : ''
                    } ${
                      getPackageTone(balance.packages, pkg.id) === 'popular'
                        ? styles.billingPackageCardPopular
                        : ''
                    } ${
                      getPackageTone(balance.packages, pkg.id) === 'premium'
                        ? styles.billingPackageCardPremium
                        : ''
                    }`}
                  >
                    <div className={styles.billingPackageAccent} />
                    <div className={styles.billingPackageMeta}>
                      <div className={styles.billingPackageTitleWrap}>
                        <div className={styles.billingPackageEyebrow}>
                          {getPackageTone(balance.packages, pkg.id) === 'starter'
                            ? 'Starter'
                            : getPackageTone(balance.packages, pkg.id) === 'premium'
                              ? 'Premium'
                              : 'Popular choice'}
                        </div>
                        <div className={styles.billingPackageTitle}>{pkg.label}</div>
                        <div className={styles.billingPackageBadges}>
                          {pkg.id === featuredStudentPackageId ? (
                            <Badge variant="green" size="sm">
                              Recommended
                            </Badge>
                          ) : null}
                          <Badge variant="blue" size="sm">
                            {pkg.lessons} lessons
                          </Badge>
                          <Badge variant={pkg.lessonsLocked ? 'green' : 'neutral'} size="sm">
                            {pkg.lessonsLocked ? 'Fixed package' : 'Flexible package'}
                          </Badge>
                        </div>
                      </div>
                      <div className={styles.billingPackagePrice}>
                        {formatMinor(pkg.amountMinor, pkg.currency)}
                      </div>
                    </div>

                    <div className={styles.billingPackageSubmeta}>
                      <span>{pkg.lessons} lessons</span>
                      <span>
                        {formatMinor(pkg.pricePerLessonMinor, pkg.currency)} per lesson
                      </span>
                    </div>

                    <div className={styles.billingPackageHint}>
                      {pkg.id === featuredStudentPackageId
                        ? 'A balanced package to highlight in discussions with the student.'
                        : pkg.lessonsLocked
                          ? 'This package size is fixed for the student.'
                          : 'This package can be offered as a flexible checkout option.'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {canAdjust ? (
            <section className={styles.billingSectionCard}>
              <BillingSectionHeader
                icon={<FileText size={18} aria-hidden />}
                eyebrow="After payment arrives"
                title="Manual credit after invoice payment"
                description="Use this only after an offline invoice has already been paid and you need to add lessons manually."
                aside={
                  <Button
                    type="button"
                    loading={pendingAction === 'manualCredit'}
                    loadingLabel="Crediting…"
                    disabled={isBusy}
                    onClick={() => void onAdjust()}
                  >
                    Credit lessons
                  </Button>
                }
              />
              {feedback?.action === 'manualCredit' ? (
                <p
                  className={
                    feedback.kind === 'success' ? styles.billingActionSuccess : styles.billingActionError
                  }
                >
                  {feedback.text}
                </p>
              ) : null}

              <div className={styles.billingNoticeCard}>
                <div className={styles.billingNoticeTitle}>Best used for manual invoice payments</div>
                <div className={styles.billingNoticeText}>
                  Add the paid lesson amount and leave a note like invoice number, bank reference,
                  or payment date for future staff context.
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Paid lessons</label>
                  <Field
                    type="number"
                    className={styles.input}
                    min={1}
                    value={lessonsToAdd}
                    onChange={(e) => setLessonsToAdd(e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Note</label>
                  <Field
                    className={styles.input}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Invoice #123"
                  />
                </div>
              </div>
            </section>
          ) : null}

          {balance.recentLedger.length > 0 ? (
            <section className={styles.billingSectionCard}>
              <LessonBalanceLedgerActivity entries={balance.recentLedger} />
            </section>
          ) : null}
        </>
      ) : null}
    </SurfaceCard>
  );
}

export function StudentLessonsTab({ lessons }: { lessons: ScheduledLessonDto[] }) {
  if (!lessons.length) {
    return <EmptyStateCard title="No lessons yet" description="Plan a lesson in the Schedule tab." />;
  }
  return (
    <div className={styles.tabStack}>
      <p className={styles.tabIntro}>
        Browse all lessons for this student, filter by status, and open a lesson for details.
      </p>
      <LessonsListPanel lessons={lessons} defaultStatusFilter="all" />
    </div>
  );
}

export function StudentScheduleTab({
  canEdit,
  date,
  setDate,
  time,
  setTime,
  recurrence,
  setRecurrence,
  comment,
  setComment,
  onPlan,
}: {
  canEdit: boolean;
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  recurrence: LessonRecurrence;
  setRecurrence: (v: LessonRecurrence) => void;
  comment: string;
  setComment: (v: string) => void;
  onPlan: () => void;
}) {
  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.tabIntro}>
        Plan a new lesson slot for this student. After saving, it appears in the Lessons tab.
      </p>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Date</label>
          <Field type="date" className={styles.input} value={date} readOnly={!canEdit} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Time</label>
          <Field type="time" className={styles.input} value={time} readOnly={!canEdit} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Recurrence</label>
          <Field as="select" className={styles.input} value={recurrence} readOnly={!canEdit} onChange={(e) => setRecurrence(e.target.value as LessonRecurrence)}>
            <option value="none">No repeat</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Field>
        </div>
      </div>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Comment</label>
        <Field as="textarea" className={`${styles.input} ${styles.notes}`} value={comment} readOnly={!canEdit} onChange={(e) => setComment(e.target.value)} rows={3} />
      </div>
      <div className={styles.actions}>
        <Button type="button" className={styles.primaryBtn} disabled={!canEdit || !date || !time} onClick={onPlan}>
          Plan lesson
        </Button>
      </div>
    </SurfaceCard>
  );
}

export function StudentAchievementsTab({
  achievements,
}: {
  achievements: Array<{ icon: React.ReactNode; label: string; description?: string; unlocked: boolean }>;
}) {
  return <ProfileAchievementsPanel achievements={achievements} />;
}

export function StudentStatisticsTab({ studentId }: { studentId: string }) {
  const { loading, error, studentLessons, studentCards } = useStudentLiveStats(studentId);
  const numericId = studentIdToNumericId(studentId);

  return (
    <StatisticsDashboard
      roleId={USER_ROLE.student.id}
      currentUserId={numericId}
      subjectStudentId={numericId}
      liveLessons={studentLessons}
      liveCards={studentCards}
      liveTitle="Student statistics"
      loading={loading}
      error={error}
    />
  );
}
