import type { MyProfileDto, UpdateMyProfileRequestDto } from '@pkg/types';
import {
  PROFICIENCY_LEVEL,
  TIME_ZONE,
  type ProficiencyLevelId,
  type TimeZoneId,
} from '@pkg/types';
import { formatTelFromStorage, normalizeTelForStorage } from './tel-mask';

export type ProfileFormState = {
  name: string;
  email: string;
  telegram: string;
  phone: string;
  timezoneId: TimeZoneId;
  nativeLanguageId: string;
  proficiencyLevelId: ProficiencyLevelId;
  bio: string;
};

const DEFAULT_TIMEZONE_ID = TIME_ZONE.kyiv.id;
const DEFAULT_PROFICIENCY_ID = PROFICIENCY_LEVEL.b1.id;

export function timeZoneIdFromIana(iana: string | null | undefined): TimeZoneId {
  if (!iana) return DEFAULT_TIMEZONE_ID;
  for (const key of Object.keys(TIME_ZONE) as (keyof typeof TIME_ZONE)[]) {
    if (TIME_ZONE[key].iana === iana) return TIME_ZONE[key].id;
  }
  return DEFAULT_TIMEZONE_ID;
}

export function proficiencyIdFromCode(code: string | null | undefined): ProficiencyLevelId {
  if (!code) return DEFAULT_PROFICIENCY_ID;
  for (const key of Object.keys(PROFICIENCY_LEVEL) as (keyof typeof PROFICIENCY_LEVEL)[]) {
    if (PROFICIENCY_LEVEL[key].code === code) return PROFICIENCY_LEVEL[key].id;
  }
  return DEFAULT_PROFICIENCY_ID;
}

export function profileToForm(profile: MyProfileDto): ProfileFormState {
  return {
    name: profile.displayName,
    email: profile.email,
    telegram: profile.telegram ?? '',
    phone: formatTelFromStorage(profile.phone),
    timezoneId: timeZoneIdFromIana(profile.timezone),
    nativeLanguageId: profile.nativeLanguageId ?? '',
    proficiencyLevelId: proficiencyIdFromCode(profile.proficiencyLevel),
    bio: profile.bio ?? '',
  };
}

export function formToUpdateInput(
  form: ProfileFormState,
  options?: { avatarUrl?: string | null },
): UpdateMyProfileRequestDto {
  const tz = Object.values(TIME_ZONE).find((entry) => entry.id === form.timezoneId);
  const level = Object.values(PROFICIENCY_LEVEL).find(
    (entry) => entry.id === form.proficiencyLevelId,
  );
  return {
    displayName: form.name.trim(),
    timezone: tz?.iana ?? TIME_ZONE.kyiv.iana,
    proficiencyLevel: level?.code ?? null,
    phone: normalizeTelForStorage(form.phone),
    telegram: form.telegram.trim() ? form.telegram.trim() : null,
    bio: form.bio.trim() ? form.bio.trim() : null,
    nativeLanguageId: form.nativeLanguageId.trim() ? form.nativeLanguageId.trim() : null,
    ...(options && 'avatarUrl' in options ? { avatarUrl: options.avatarUrl } : {}),
  };
}

export function formToCompletenessInput(
  form: ProfileFormState,
  avatarUrl: string | null | undefined,
): Pick<
  MyProfileDto,
  | 'displayName'
  | 'email'
  | 'avatarUrl'
  | 'timezone'
  | 'proficiencyLevel'
  | 'phone'
  | 'telegram'
  | 'bio'
  | 'nativeLanguageId'
> {
  const tz = Object.values(TIME_ZONE).find((entry) => entry.id === form.timezoneId);
  const level = Object.values(PROFICIENCY_LEVEL).find(
    (entry) => entry.id === form.proficiencyLevelId,
  );
  return {
    displayName: form.name,
    email: form.email,
    avatarUrl: avatarUrl ?? null,
    timezone: tz?.iana ?? TIME_ZONE.kyiv.iana,
    proficiencyLevel: level?.code ?? null,
    phone: normalizeTelForStorage(form.phone),
    telegram: form.telegram.trim() || null,
    bio: form.bio.trim() || null,
    nativeLanguageId: form.nativeLanguageId.trim() || null,
  };
}
