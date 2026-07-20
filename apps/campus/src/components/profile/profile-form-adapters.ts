import type { MyProfileDto } from '@pkg/types';
import {
  PROFICIENCY_LEVEL,
  TIME_ZONE,
  formatTimeZoneOptionLabel,
  getTimeZoneById,
  getUserAccountStatusById,
} from '@pkg/types';
import type { MockStudent } from '../../lib/user-models';
import type { ProfileFormState } from '../../lib/profile-form';
import {
  proficiencyIdFromCode,
  timeZoneIdFromIana,
} from '../../lib/profile-form';
import { formatTelFromStorage } from '../../lib/tel-mask';
import type { TranslateFn } from '../../lib/cms/nav-i18n';
import type {
  ProfileFormContext,
  ProfileSummaryData,
  UnifiedProfileFormValues,
} from './unified-profile-types';
import { isFieldVisible, subjectRoleLabel } from './profile-field-policy';

const STAFF_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'leaved', label: 'Left' },
  { value: 'blocked', label: 'Blocked' },
] as const;

function staffStatusLabel(status: UnifiedProfileFormValues['staffStatus']): string {
  if (!status) return '—';
  return STAFF_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function timezoneSummaryLabel(timezoneId: UnifiedProfileFormValues['timezoneId']): string {
  const tz = getTimeZoneById(timezoneId);
  return tz ? formatTimeZoneOptionLabel(tz) : '—';
}

function proficiencySummaryLabel(levelId: UnifiedProfileFormValues['proficiencyLevelId']): string {
  const level = Object.values(PROFICIENCY_LEVEL).find((entry) => entry.id === levelId);
  return level ? `${level.code} — ${level.label}` : '—';
}

export function profileFormStateToUnified(form: ProfileFormState): UnifiedProfileFormValues {
  return {
    displayName: form.name,
    email: form.email,
    phone: form.phone,
    telegram: form.telegram,
    timezoneId: form.timezoneId,
    nativeLanguageId: form.nativeLanguageId,
    proficiencyLevelId: form.proficiencyLevelId,
    bio: form.bio,
  };
}

export function unifiedToProfileFormState(
  form: ProfileFormState,
  patch: Partial<UnifiedProfileFormValues>,
): ProfileFormState {
  return {
    ...form,
    name: patch.displayName ?? form.name,
    email: patch.email ?? form.email,
    phone: patch.phone ?? form.phone,
    telegram: patch.telegram ?? form.telegram,
    timezoneId: patch.timezoneId ?? form.timezoneId,
    nativeLanguageId: patch.nativeLanguageId ?? form.nativeLanguageId,
    proficiencyLevelId: patch.proficiencyLevelId ?? form.proficiencyLevelId,
    bio: patch.bio ?? form.bio,
  };
}

export function myProfileToUnified(profile: MyProfileDto, roleLabel: string): UnifiedProfileFormValues {
  return {
    displayName: profile.displayName,
    email: profile.email,
    phone: formatTelFromStorage(profile.phone),
    telegram: profile.telegram ?? '',
    timezoneId: timeZoneIdFromIana(profile.timezone),
    nativeLanguageId: profile.nativeLanguageId ?? '',
    proficiencyLevelId: proficiencyIdFromCode(profile.proficiencyLevel),
    bio: profile.bio ?? '',
    staffStatus: profile.status,
    roleLabel,
  };
}

export function unifiedToMyProfile(
  profile: MyProfileDto,
  values: UnifiedProfileFormValues,
): MyProfileDto {
  const tz = Object.values(TIME_ZONE).find((entry) => entry.id === values.timezoneId);
  return {
    ...profile,
    displayName: values.displayName,
    phone: values.phone.trim() ? values.phone.trim() : null,
    telegram: values.telegram.trim() ? values.telegram.trim() : null,
    timezone: tz?.iana ?? profile.timezone,
    bio: values.bio.trim() ? values.bio.trim() : null,
    status: values.staffStatus ?? profile.status,
  };
}

export function studentToUnified(
  student: MockStudent,
  nativeLanguageId: string,
  assignedTeacherId: string | null,
): UnifiedProfileFormValues {
  return {
    displayName: student.fullName,
    email: student.email,
    phone: student.phone,
    telegram: '',
    timezoneId: student.timezoneId,
    nativeLanguageId,
    proficiencyLevelId: student.proficiencyLevelId,
    bio: '',
    studentStatusId: student.statusId,
    scheduleType: student.scheduleType,
    lessonFormat: student.lessonFormat,
    userColor: student.color ?? '',
    assignedTeacherId,
  };
}

export function unifiedToStudent(
  student: MockStudent,
  values: UnifiedProfileFormValues,
): MockStudent {
  return {
    ...student,
    fullName: values.displayName,
    email: values.email,
    phone: values.phone,
    timezoneId: values.timezoneId,
    proficiencyLevelId: values.proficiencyLevelId,
    statusId: values.studentStatusId ?? student.statusId,
    scheduleType: values.scheduleType ?? student.scheduleType,
    lessonFormat: values.lessonFormat ?? student.lessonFormat,
    color: values.userColor ?? student.color,
  };
}

export function buildProfileSummary(
  values: UnifiedProfileFormValues,
  ctx: ProfileFormContext,
  t?: TranslateFn,
): ProfileSummaryData {
  const role =
    values.roleLabel ??
    (ctx.subjectKind === 'self'
      ? subjectRoleLabel(ctx.subjectRole ?? ctx.viewerRole, t)
      : ctx.subjectKind === 'staff'
        ? values.roleLabel ?? (t ? t('profile.role.staff') : 'Staff')
        : t ? t('profile.role.student') : 'Student');

  const subtitle =
    ctx.subjectKind === 'staff'
      ? `${values.email} · ${role}`
      : ctx.subjectKind === 'student'
        ? `${values.email}${role ? ` · ${role}` : ''}`
        : `${values.email} · ${role}`;

  const items: ProfileSummaryData['items'] = [];
  const label = (key: string, fallback: string) => (t ? t(key) : fallback);

  if (ctx.subjectKind === 'staff' && values.staffStatus) {
    items.push({ label: label('profile.summary.status', 'Status'), value: staffStatusLabel(values.staffStatus) });
  }

  if (ctx.subjectKind === 'student' && isFieldVisible('proficiency', ctx)) {
    items.push({ label: label('profile.summary.level', 'Level'), value: proficiencySummaryLabel(values.proficiencyLevelId) });
  }

  if (
    ctx.subjectKind === 'student' &&
    values.studentStatusId !== undefined &&
    isFieldVisible('studentStatus', ctx)
  ) {
    items.push({
      label: label('profile.summary.status', 'Status'),
      value: getUserAccountStatusById(values.studentStatusId)?.name ?? '—',
    });
  }

  items.push({ label: label('profile.summary.timezone', 'Timezone'), value: timezoneSummaryLabel(values.timezoneId) });

  if (isFieldVisible('phone', ctx)) {
    items.push({ label: label('profile.summary.phone', 'Phone'), value: values.phone.trim() || '—' });
  }

  if (isFieldVisible('telegram', ctx)) {
    items.push({ label: label('profile.summary.telegram', 'Telegram'), value: values.telegram.trim() || '—' });
  }

  return {
    title: values.displayName.trim() || (t ? t('profile.tab.profile') : 'Profile'),
    subtitle,
    items,
  };
}

export function profileIntro(ctx: ProfileFormContext, t?: TranslateFn): string {
  if (t) {
    if (ctx.subjectKind === 'staff') return t('profile.intro.staff');
    if (ctx.subjectKind === 'student') return t('profile.intro.student');
    return t('profile.intro.self');
  }
  if (ctx.subjectKind === 'staff') {
    return 'Update contact details and account status for this staff member. Email is managed separately and cannot be changed here.';
  }
  if (ctx.subjectKind === 'student') {
    return 'Manage core student profile settings, contacts, native language, timezone, and user color.';
  }
  return 'Your name, contact details, timezone, and learning preferences shown across Arvilio.';
}
