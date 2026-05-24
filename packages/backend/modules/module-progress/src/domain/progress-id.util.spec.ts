import { hashPartyId } from './progress-id.util';

describe('hashPartyId', () => {
  it('returns stable positive numbers for the same id', () => {
    expect(hashPartyId('user-abc')).toBe(hashPartyId('user-abc'));
    expect(hashPartyId('user-abc')).toBeGreaterThan(0);
  });

  it('differs for different ids', () => {
    expect(hashPartyId('a')).not.toBe(hashPartyId('b'));
  });
});
