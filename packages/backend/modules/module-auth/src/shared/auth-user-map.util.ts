import { BadRequestException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { AuthUserDto } from '@pkg/types';

const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar.events',
];

export type UserRoleName = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

export const PROFICIENCY_LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const ACCOUNT_STATUSES = new Set(['ACTIVE', 'PAUSED', 'LEAVED', 'BLOCKED']);

export function getGoogleClient(): OAuth2Client | null {
  const clientId = process.env['GOOGLE_CLIENT_ID'];
  const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
  const callbackUrl =
    process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:3000/api/auth/google/callback';
  if (!clientId || !clientSecret) return null;
  return new OAuth2Client({ clientId, clientSecret, redirectUri: callbackUrl });
}

export function buildGoogleAuthUrl(): string {
  const client = getGoogleClient();
  if (!client) {
    throw new BadRequestException('Google OAuth is not configured on the server');
  }
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_OAUTH_SCOPES,
  });
}

export function mapUserToDto(user: {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED';
  proficiencyLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
  timezone: string;
  teacherId: string | null;
  passwordHash: string | null;
  oauthAccounts?: Array<{ provider: 'GOOGLE' | 'FACEBOOK' | 'TELEGRAM' }>;
}): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role.toLowerCase() as AuthUserDto['role'],
    status: user.status.toLowerCase() as AuthUserDto['status'],
    proficiencyLevel: user.proficiencyLevel ?? null,
    timezone: user.timezone,
    teacherId: user.teacherId,
    hasPassword: Boolean(user.passwordHash),
    linkedProviders: (user.oauthAccounts ?? []).map(
      (account) => account.provider.toLowerCase() as AuthUserDto['linkedProviders'][number],
    ),
  };
}
