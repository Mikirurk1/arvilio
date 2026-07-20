import type { MyProfileDto } from '@pkg/types';

export type ProfileCompletenessInput = Pick<
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
>;

export function isMyProfileComplete(profile: ProfileCompletenessInput): boolean {
  return Boolean(
    profile.displayName?.trim() &&
      profile.email?.trim() &&
      profile.avatarUrl?.trim() &&
      profile.timezone?.trim() &&
      profile.proficiencyLevel &&
      profile.phone?.trim() &&
      profile.telegram?.trim() &&
      profile.bio?.trim() &&
      profile.nativeLanguageId?.trim(),
  );
}
