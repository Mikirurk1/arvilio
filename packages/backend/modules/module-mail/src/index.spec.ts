import * as mail from './index';
import { generateTemporaryPassword } from './shared/password.util';

describe('module-mail index', () => {
  it('re-exports MailModule and MailService', () => {
    expect(mail.MailModule).toBeDefined();
    expect(mail.MailService).toBeDefined();
  });

  it('re-exports generateTemporaryPassword', () => {
    expect(mail.generateTemporaryPassword).toBe(generateTemporaryPassword);
    expect(mail.generateTemporaryPassword()).toHaveLength(14);
  });
});
