import { getAvatarFallbackInitials } from './avatar';

describe('avatar', () => {
  it('returns ? for empty name', () => {
    expect(getAvatarFallbackInitials('   ')).toBe('?');
  });

  it('uses first two letters for single token', () => {
    expect(getAvatarFallbackInitials('alice')).toBe('AL');
  });

  it('uses first and last initials for multiple tokens', () => {
    expect(getAvatarFallbackInitials('Anna Maria Smith')).toBe('AS');
  });
});
