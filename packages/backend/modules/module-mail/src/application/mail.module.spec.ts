import { Test } from '@nestjs/testing';
import { MailModule } from '../mail.module';
import { MailService } from './mail.service';

jest.mock('@be/email-templates', () => ({
  renderEmail: jest.fn().mockResolvedValue({ subject: 'S', html: '<p></p>', text: 'S' }),
  renderEmailFromVars: jest.fn().mockResolvedValue({ subject: 'S', html: '<p></p>', text: 'S' }),
}));

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn(),
      verify: jest.fn(),
    })),
  },
}));

describe('MailModule', () => {
  it('registers MailService as global provider', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MailModule],
    }).compile();

    const mail = moduleRef.get(MailService);
    expect(mail).toBeInstanceOf(MailService);
    expect(mail.isConfigured()).toBe(false);
  });
});
