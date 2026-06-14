import type {
  PlatformIntegrationConfigDto,
  PlatformIntegrationSecretsDto,
} from '@pkg/types';

export type SmtpFormDraft = {
  smtp: PlatformIntegrationConfigDto['smtp'];
  secrets: PlatformIntegrationSecretsDto;
};

export function smtpVerifyMutationVariables(draft: SmtpFormDraft) {
  const hasPass = draft.secrets.smtpPass !== undefined && draft.secrets.smtpPass !== '';
  return {
    input: {
      config: { smtp: draft.smtp },
      secrets: hasPass ? { smtpPass: draft.secrets.smtpPass } : undefined,
    },
  };
}

export function canVerifySmtp(draft: SmtpFormDraft | null): boolean {
  if (!draft) return false;
  if (draft.smtp.mode === 'custom') return Boolean(draft.smtp.host?.trim());
  return true;
}
