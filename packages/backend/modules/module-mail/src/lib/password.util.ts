import { randomBytes } from 'node:crypto';

const CHARSET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';

/** Cryptographically random password for one-time delivery by email. */
export function generateTemporaryPassword(length = 14): string {
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += CHARSET[bytes[i]! % CHARSET.length]!;
  }
  return password;
}
