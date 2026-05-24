import { generateTemporaryPassword } from './password.util';

describe('generateTemporaryPassword', () => {
  it('returns password of requested length', () => {
    expect(generateTemporaryPassword(12)).toHaveLength(12);
  });

  it('uses charset characters only', () => {
    const charset = /^[abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*]+$/;
    expect(generateTemporaryPassword(20)).toMatch(charset);
  });
});
