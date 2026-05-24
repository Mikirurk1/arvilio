'use client';

import { useEffect, useRef, useState } from 'react';
import type { LessonRecurrence, ScheduledLessonDto } from '@pkg/types';
import { Button, EmptyStateCard, Field, SurfaceCard } from '../../../components/ui';
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
import { Pipette } from 'lucide-react';
import styles from './page.module.scss';

type HslColor = { h: number; s: number; l: number };

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
