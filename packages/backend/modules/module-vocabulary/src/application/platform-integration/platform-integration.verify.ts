import type { ResolvedPlatformIntegration } from './platform-integration.config.util';

export type VerifyConnectionOutcome = {
  ok: boolean;
  message: string;
};

export async function verifyGoogleOAuth(
  google: ResolvedPlatformIntegration['google'],
): Promise<VerifyConnectionOutcome> {
  if (!google.clientId?.trim() || !google.clientSecret?.trim()) {
    return { ok: false, message: 'Google Client ID and client secret are required' };
  }
  if (!google.callbackUrl?.trim()) {
    return { ok: false, message: 'Google callback URL is required' };
  }

  try {
    const body = new URLSearchParams({
      client_id: google.clientId.trim(),
      client_secret: google.clientSecret.trim(),
      code: 'soenglish-connection-verify',
      grant_type: 'authorization_code',
      redirect_uri: google.callbackUrl.trim(),
    });
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = (await response.json()) as {
      error?: string;
      error_description?: string;
    };

    if (data.error === 'invalid_grant') {
      return { ok: true, message: 'Google OAuth client ID and secret are valid' };
    }
    if (data.error === 'redirect_uri_mismatch') {
      return {
        ok: false,
        message:
          'Callback URL does not match an authorized redirect URI in Google Cloud Console',
      };
    }
    if (data.error === 'invalid_client' || data.error === 'unauthorized_client') {
      return {
        ok: false,
        message: data.error_description ?? 'Invalid Google client ID or secret',
      };
    }

    return {
      ok: false,
      message: data.error_description ?? data.error ?? 'Google OAuth verification failed',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Google OAuth verification failed',
    };
  }
}

export async function verifyFacebookApp(
  facebook: ResolvedPlatformIntegration['facebook'],
): Promise<VerifyConnectionOutcome> {
  if (!facebook.appId?.trim() || !facebook.appSecret?.trim()) {
    return { ok: false, message: 'Facebook App ID and app secret are required' };
  }

  try {
    const params = new URLSearchParams({
      client_id: facebook.appId.trim(),
      client_secret: facebook.appSecret.trim(),
      grant_type: 'client_credentials',
    });
    const response = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?${params.toString()}`,
    );
    const data = (await response.json()) as {
      access_token?: string;
      error?: { message?: string };
    };

    if (data.access_token) {
      return { ok: true, message: 'Facebook app credentials are valid' };
    }

    return {
      ok: false,
      message: data.error?.message ?? 'Facebook app verification failed',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Facebook verification failed',
    };
  }
}

export async function verifyTelegramBot(
  telegram: ResolvedPlatformIntegration['telegram'],
): Promise<VerifyConnectionOutcome> {
  const token = telegram.botToken?.trim();
  if (!token) {
    return { ok: false, message: 'Telegram bot token is required' };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = (await response.json()) as {
      ok?: boolean;
      description?: string;
      result?: { username?: string; first_name?: string };
    };

    if (!data.ok || !data.result) {
      return { ok: false, message: data.description ?? 'Telegram bot token is invalid' };
    }

    const username = data.result.username?.trim();
    const expected = telegram.botUsername?.replace(/^@/, '').trim();
    if (expected && username && expected.toLowerCase() !== username.toLowerCase()) {
      return {
        ok: false,
        message: `Token belongs to @${username}, but username field is @${expected}`,
      };
    }

    const label = username ? `@${username}` : (data.result.first_name ?? 'bot');
    return { ok: true, message: `Telegram bot ${label} is reachable` };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Telegram verification failed',
    };
  }
}
