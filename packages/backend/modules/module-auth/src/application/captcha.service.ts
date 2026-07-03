import { Injectable, Logger } from '@nestjs/common';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies Cloudflare Turnstile tokens server-side (G37).
 * When CAPTCHA_SECRET is not set, verification is skipped (dev/test mode).
 */
@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly secret = process.env['CAPTCHA_SECRET'] ?? '';

  isEnabled(): boolean {
    return Boolean(this.secret);
  }

  /**
   * Verifies a Turnstile challenge response token.
   * Returns true if valid, or if captcha is disabled (no CAPTCHA_SECRET).
   * Returns false if the token is invalid or the verify request fails.
   */
  async verify(token: string | undefined | null, ip?: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return true;
    }
    if (!token) {
      this.logger.warn('Captcha token missing; CAPTCHA_SECRET is set — rejecting');
      return false;
    }

    const body = new URLSearchParams({ secret: this.secret, response: token });
    if (ip) body.set('remoteip', ip);

    try {
      const res = await fetch(TURNSTILE_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const json = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
      if (!json.success) {
        this.logger.warn('Captcha verification failed', json['error-codes']);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error('Captcha verify request failed', err instanceof Error ? err.stack : String(err));
      // Fail open on network errors — captcha provider outage should not block signups.
      return true;
    }
  }
}
