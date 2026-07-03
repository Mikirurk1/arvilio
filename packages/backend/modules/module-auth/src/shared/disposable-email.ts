/**
 * Disposable/throwaway email domain blocklist (G37).
 * Checked at school signup to prevent trial farming.
 * Extend as needed; keep sorted for readability.
 */
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '20minutemail.com',
  'discard.email',
  'disposablemail.com',
  'fakeinbox.com',
  'getairmail.com',
  'guerrillamail.com',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'mailinator.com',
  'mailinator2.com',
  'maildrop.cc',
  'mailnesia.com',
  'mailnull.com',
  'mintemail.com',
  'mohmal.com',
  'mytemp.email',
  'nada.email',
  'sharklasers.com',
  'spamgourmet.com',
  'spamgourmet.net',
  'spamgourmet.org',
  'tempail.com',
  'tempemail.net',
  'tempinbox.com',
  'tempmail.com',
  'tempmail.net',
  'throwam.com',
  'throwaway.email',
  'trashmail.at',
  'trashmail.com',
  'trashmail.io',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
]);

/** Returns true when the email's domain is a known disposable/throwaway provider. */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  return DISPOSABLE_DOMAINS.has(email.slice(at + 1).toLowerCase());
}
