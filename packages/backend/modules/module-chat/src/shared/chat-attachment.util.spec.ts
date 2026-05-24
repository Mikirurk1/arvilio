import { BadRequestException } from '@nestjs/common';
import { assertChatFileAllowed, messagePreview } from './chat-attachment.util';

describe('chat-attachment.util', () => {
  it('assertChatFileAllowed accepts png', () => {
    const result = assertChatFileAllowed({
      originalname: 'photo.png',
      mimetype: 'image/png',
      size: 1000,
    });
    expect(result.safeName).toBe('photo.png');
  });

  it('assertChatFileAllowed rejects huge file', () => {
    expect(() =>
      assertChatFileAllowed({
        originalname: 'big.bin',
        mimetype: 'application/octet-stream',
        size: 10_000_000,
      }),
    ).toThrow(BadRequestException);
  });

  it('messagePreview prefers body then attachment', () => {
    expect(messagePreview('hello')).toBe('hello');
    expect(messagePreview('', 'doc.pdf')).toContain('doc.pdf');
  });

  it('assertChatFileAllowed rejects disallowed mime type', () => {
    expect(() =>
      assertChatFileAllowed({
        originalname: 'script.exe',
        mimetype: 'application/octet-stream',
        size: 100,
      }),
    ).toThrow(BadRequestException);
  });

  it('assertChatFileAllowed sanitizes unsafe file names', () => {
    const result = assertChatFileAllowed({
      originalname: 'my file<script>.pdf',
      mimetype: 'application/pdf',
      size: 100,
    });
    expect(result.safeName).not.toContain('<');
  });
});
