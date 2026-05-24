import { mockProfileCompletenessInput } from '../testing/fixtures';
import { isMyProfileComplete } from './profile-complete';

const complete = mockProfileCompletenessInput({
  avatarUrl: 'https://cdn/a.png',
  phone: '+123',
  telegram: '@u',
  bio: 'Bio',
});

describe('isMyProfileComplete', () => {
  it('returns true when all fields set', () => {
    expect(isMyProfileComplete(complete)).toBe(true);
  });

  it('returns false when avatar missing', () => {
    expect(isMyProfileComplete({ ...complete, avatarUrl: '' })).toBe(false);
  });

  it('returns false when proficiency missing', () => {
    expect(isMyProfileComplete({ ...complete, proficiencyLevel: null })).toBe(false);
  });
});
