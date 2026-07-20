import { TIME_ZONE, PROFICIENCY_LEVEL } from '@pkg/types';
import { mockMyProfile } from '../testing/fixtures';
import {
  formToCompletenessInput,
  formToUpdateInput,
  profileToForm,
  proficiencyIdFromCode,
  timeZoneIdFromIana,
} from './profile-form';

const sampleProfile = mockMyProfile({
  id: 'u1',
  email: 'user@test.com',
  phone: '+380501234567',
  telegram: '@user',
  bio: 'Bio',
  nativeLanguageId: 'en-id',
});

describe('profile-form', () => {
  it('timeZoneIdFromIana maps kyiv', () => {
    expect(timeZoneIdFromIana('Europe/Kyiv')).toBe(TIME_ZONE.kyiv.id);
    expect(timeZoneIdFromIana(undefined)).toBe(TIME_ZONE.kyiv.id);
  });

  it('proficiencyIdFromCode maps B1', () => {
    expect(proficiencyIdFromCode('B1')).toBe(PROFICIENCY_LEVEL.b1.id);
  });

  it('profileToForm and formToUpdateInput round-trip core fields', () => {
    const form = profileToForm(sampleProfile);
    const input = formToUpdateInput(form);
    expect(input.displayName).toBe('User');
    expect(input.timezone).toBe('Europe/Kyiv');
    expect(input.proficiencyLevel).toBe('B1');
    expect(input.phone).toBe('+380501234567');
  });

  it('formToCompletenessInput maps avatar and nullable fields', () => {
    const form = profileToForm(sampleProfile);
    const completeness = formToCompletenessInput(form, 'https://cdn/avatar.png');
    expect(completeness.avatarUrl).toBe('https://cdn/avatar.png');
    expect(completeness.displayName).toBe('User');
    expect(completeness.nativeLanguageId).toBe('en-id');
  });
});
