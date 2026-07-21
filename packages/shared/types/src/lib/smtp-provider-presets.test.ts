import { matchSmtpProviderPreset, SMTP_PROVIDER_PRESETS } from './shared-types';

describe('SMTP_PROVIDER_PRESETS', () => {
  it('includes Resend, Brevo, SES, Mailtrap, and Custom', () => {
    const ids = SMTP_PROVIDER_PRESETS.map((p) => p.id);
    expect(ids).toEqual(['custom', 'resend', 'brevo', 'amazon_ses', 'mailtrap']);
  });

  it('Resend uses smtp.resend.com:465 secure', () => {
    const resend = SMTP_PROVIDER_PRESETS.find((p) => p.id === 'resend');
    expect(resend).toMatchObject({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      suggestedUser: 'resend',
    });
  });
});

describe('matchSmtpProviderPreset', () => {
  it('returns custom for empty host', () => {
    expect(matchSmtpProviderPreset(null, 587)).toBe('custom');
    expect(matchSmtpProviderPreset('', 587)).toBe('custom');
    expect(matchSmtpProviderPreset('  ', null)).toBe('custom');
  });

  it('matches Resend host+port', () => {
    expect(matchSmtpProviderPreset('smtp.resend.com', 465)).toBe('resend');
    expect(matchSmtpProviderPreset('SMTP.RESEND.COM', 465)).toBe('resend');
  });

  it('matches Brevo and Mailtrap exact presets', () => {
    expect(matchSmtpProviderPreset('smtp-relay.brevo.com', 587)).toBe('brevo');
    expect(matchSmtpProviderPreset('sandbox.smtp.mailtrap.io', 2525)).toBe('mailtrap');
  });

  it('matches when port is omitted but host equals a preset', () => {
    expect(matchSmtpProviderPreset('smtp.resend.com', null)).toBe('resend');
  });

  it('returns custom when host matches but port differs', () => {
    expect(matchSmtpProviderPreset('smtp.resend.com', 587)).toBe('custom');
  });

  it('fuzzy-matches Amazon SES region hosts', () => {
    expect(matchSmtpProviderPreset('email-smtp.eu-west-1.amazonaws.com', 587)).toBe('amazon_ses');
  });

  it('fuzzy-matches mailtrap in hostname', () => {
    expect(matchSmtpProviderPreset('live.smtp.mailtrap.io', 587)).toBe('mailtrap');
  });

  it('returns custom for unknown hosts', () => {
    expect(matchSmtpProviderPreset('smtp.example.com', 587)).toBe('custom');
  });
});
