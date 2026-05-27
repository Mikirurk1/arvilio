import { ForbiddenException } from '@nestjs/common';

export type AuthAccountStatus = 'ACTIVE' | 'PAUSED' | 'LEAVED' | 'BLOCKED';
export type AccountStatusDenialCode =
  | 'account_paused'
  | 'account_leaved'
  | 'account_blocked';

const ACCOUNT_STATUS_DENIALS: Record<
  Exclude<AuthAccountStatus, 'ACTIVE'>,
  { code: AccountStatusDenialCode; message: string }
> = {
  PAUSED: {
    code: 'account_paused',
    message: 'Your account is paused. Contact your administrator to reactivate it.',
  },
  LEAVED: {
    code: 'account_leaved',
    message: 'Your account is no longer active at this school. Contact your administrator if this is a mistake.',
  },
  BLOCKED: {
    code: 'account_blocked',
    message: 'Your account is blocked. Contact support or your administrator.',
  },
};

export function getAccountStatusDenial(
  status: string | null | undefined,
): { code: AccountStatusDenialCode; message: string } | null {
  if (!status || status === 'ACTIVE') return null;
  return ACCOUNT_STATUS_DENIALS[status as Exclude<AuthAccountStatus, 'ACTIVE'>] ?? null;
}

export function assertAccountStatusAllowsAuth(status: string | null | undefined): void {
  const denial = getAccountStatusDenial(status);
  if (denial) {
    throw new ForbiddenException(denial);
  }
}
