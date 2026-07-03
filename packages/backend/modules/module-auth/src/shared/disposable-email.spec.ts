import { isDisposableEmail } from './disposable-email';

describe('isDisposableEmail', () => {
  it('returns true for known disposable domains', () => {
    expect(isDisposableEmail('user@mailinator.com')).toBe(true);
    expect(isDisposableEmail('test@yopmail.com')).toBe(true);
    expect(isDisposableEmail('anything@tempmail.com')).toBe(true);
    expect(isDisposableEmail('x@guerrillamail.com')).toBe(true);
  });

  it('is case-insensitive on the domain', () => {
    expect(isDisposableEmail('user@MAILINATOR.COM')).toBe(true);
    expect(isDisposableEmail('user@TrAsHmAiL.com')).toBe(true);
  });

  it('returns false for real email domains', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false);
    expect(isDisposableEmail('admin@myschool.edu')).toBe(false);
    expect(isDisposableEmail('info@company.io')).toBe(false);
  });

  it('returns false for malformed input', () => {
    expect(isDisposableEmail('notanemail')).toBe(false);
    expect(isDisposableEmail('')).toBe(false);
  });
});
