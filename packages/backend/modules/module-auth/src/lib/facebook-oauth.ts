import { BadRequestException } from '@nestjs/common';

export type FacebookTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export type FacebookProfile = {
  id: string;
  name?: string;
  email?: string;
};

function facebookConfig() {
  const appId = process.env['FACEBOOK_APP_ID'];
  const appSecret = process.env['FACEBOOK_APP_SECRET'];
  const callbackUrl =
    process.env['FACEBOOK_CALLBACK_URL'] ?? 'http://localhost:3000/api/auth/facebook/callback';
  if (!appId || !appSecret) return null;
  return { appId, appSecret, callbackUrl };
}

export function buildFacebookAuthUrl(): string {
  const config = facebookConfig();
  if (!config) {
    throw new BadRequestException('Facebook OAuth is not configured on the server');
  }
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.callbackUrl,
    scope: 'email,public_profile',
    response_type: 'code',
    state: 'link',
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeFacebookCode(code: string): Promise<{
  accessToken: string;
  profile: FacebookProfile;
}> {
  const config = facebookConfig();
  if (!config) {
    throw new BadRequestException('Facebook OAuth is not configured on the server');
  }

  const tokenParams = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.callbackUrl,
    code,
  });
  const tokenRes = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?${tokenParams.toString()}`,
  );
  if (!tokenRes.ok) {
    throw new BadRequestException('Facebook token exchange failed');
  }
  const tokenJson = (await tokenRes.json()) as FacebookTokenResponse;
  if (!tokenJson.access_token) {
    throw new BadRequestException('Facebook did not return an access token');
  }

  const profileParams = new URLSearchParams({
    fields: 'id,name,email',
    access_token: tokenJson.access_token,
  });
  const profileRes = await fetch(`https://graph.facebook.com/me?${profileParams.toString()}`);
  if (!profileRes.ok) {
    throw new BadRequestException('Failed to load Facebook profile');
  }
  const profile = (await profileRes.json()) as FacebookProfile;
  if (!profile.id) {
    throw new BadRequestException('Facebook profile is missing id');
  }

  return { accessToken: tokenJson.access_token, profile };
}
