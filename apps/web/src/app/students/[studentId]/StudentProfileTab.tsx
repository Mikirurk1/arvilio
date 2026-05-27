'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type {
  ManualInvoiceMethodDto,
  ManualInvoiceMethodKindDto,
  PaymentMethodKindDto,
} from '@pkg/types';
import { selectLanguagesList, useLanguagesStore } from '../../../stores/languages-store';
import { Badge, Button, Field, SurfaceCard } from '../../../components/ui';
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
import { Pipette } from 'lucide-react';
import styles from './page.module.scss';

type HslColor = { h: number; s: number; l: number };

// Kept here because it was previously module-scope in `sections.tsx`.
// Other tabs still use their own copies; we are extracting just the default tab.
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
    return (
      [method.bankName, method.bankCountry, method.iban].filter(Boolean).join(' · ') ||
      'IBAN / SEPA'
    );
  }
  if (method.kind === 'swift_wire') {
    return (
      [method.bankName, method.swiftBic, method.iban ?? method.accountNumber]
        .filter(Boolean)
        .join(' · ') || 'SWIFT wire'
    );
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
    return Boolean(method.beneficiaryName.trim() && method.bankName.trim() && method.cardNumber.trim());
  }
  return Boolean(method.instructionsUk.trim());
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
        <Button
          type="button"
          className={styles.colorPickerToggleBtn}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
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
              if (!disabled && event.buttons === 1)
                updateFromPalettePointer(event.clientX, event.clientY);
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
  const canManageUserColor = !isStudentViewer && (isTeacherViewer || canAssignTeacher);

  useEffect(() => {
    if (showNativeLanguage) void fetchLanguages();
  }, [fetchLanguages, showNativeLanguage]);

  // NOTE: The remainder of the profile form body stays identical to `sections.tsx`.
  // We keep it in this extracted file to reduce the default student-details chunk size.
  return (
    <SurfaceCard className={styles.tabCard}>
      <p className={styles.tabIntro}>
        Manage core student profile settings, contacts, native language, timezone, and user color.
      </p>
      {/* The rest of the form is still rendered from the extracted module. */}
      {/* Intentionally kept minimal in this snippet; we continue rendering below via original JSX. */}
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Full name</label>
          <Field
            className={styles.input}
            value={student.fullName}
            readOnly={!canEdit}
            onChange={(e) => onChange({ ...student, fullName: e.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <Field
            className={styles.input}
            value={student.email}
            readOnly={!canEdit}
            onChange={(e) => onChange({ ...student, email: e.target.value })}
          />
        </div>

        {!isStudentViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Level</label>
            <Field
              as="select"
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
                const level = PROFICIENCY_LEVEL[key];
                return (
                  <option key={level.id} value={level.id}>
                    {level.code} — {level.label}
                  </option>
                );
              })}
            </Field>
          </div>
        ) : null}

        {!isTeacherViewer ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone</label>
            <Field
              className={styles.input}
              value={student.phone}
              readOnly={!canEdit}
              onChange={(e) => onChange({ ...student, phone: e.target.value })}
            />
          </div>
        ) : null}

        {showNativeLanguage && onNativeLanguageIdChange ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Native language</label>
            <Field
              as="select"
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
          <Field
            as="select"
            className={styles.input}
            value={String(student.timezoneId)}
            readOnly={!canEdit}
            onChange={(e) =>
              onChange({
                ...student,
                timezoneId: Number(e.target.value) as MockStudent['timezoneId'],
              })
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
            <Field
              as="select"
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
              {USER_ACCOUNT_STATUS_ID_LIST.map((id) => (
                <option key={id} value={id}>
                  {getUserAccountStatusById(id)?.name ?? '—'}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {canAssignTeacher ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Assigned teacher</label>
            <Field
              as="select"
              className={styles.input}
              value={teacherBackendId ?? ''}
              readOnly={!canEdit}
              onChange={(e) => onTeacherBackendIdChange(e.target.value || null)}
            >
              <option value="">—</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.displayName}
                </option>
              ))}
            </Field>
          </div>
        ) : null}

        {canManageUserColor ? (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>User color</label>
            <UserColorPicker
              value={student.color ?? ''}
              disabled={!canEdit}
              onChange={(value) => onChange({ ...student, color: value })}
            />
          </div>
        ) : null}
      </div>

      <div className={styles.profileSaveRow}>
        {saveError ? <div className={styles.profileSaveError}>{saveError}</div> : null}
        {saved ? <Badge variant="green">Saved</Badge> : null}
        <Button type="button" onClick={onSave} disabled={!canEdit}>
          Save student data
        </Button>
      </div>
    </SurfaceCard>
  );
}

