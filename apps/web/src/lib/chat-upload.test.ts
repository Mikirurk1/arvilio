import { mockChatAttachment } from '../testing/fixtures';
import { chatAttachmentHref, chatMessagePreview, uploadChatAttachment } from './chat-upload';

describe('chat-upload', () => {
  it('chatAttachmentHref keeps /api paths', () => {
    expect(chatAttachmentHref('/api/chat/files/1')).toBe('/api/chat/files/1');
  });

  it('chatAttachmentHref prefixes relative paths', () => {
    expect(chatAttachmentHref('/chat/files/1')).toContain('/chat/files/1');
  });

  it('chatMessagePreview prefers body', () => {
    expect(chatMessagePreview({ body: 'Hi', attachment: null })).toBe('Hi');
    expect(
      chatMessagePreview({
        body: '',
        attachment: mockChatAttachment({ fileName: 'doc.pdf', url: '/x', mimeType: 'application/pdf' }),
      }),
    ).toContain('doc.pdf');
  });

  it('uploadChatAttachment posts multipart form', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'm1', body: 'Hi', attachment: null }),
    }) as typeof fetch;

    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const message = await uploadChatAttachment('conv-1', file, 'caption');
    expect(message.id).toBe('m1');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/conversations/conv-1/attachments'),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    global.fetch = originalFetch;
  });

  it('chatAttachmentHref returns empty string unchanged', () => {
    expect(chatAttachmentHref('')).toBe('');
  });

  it('chatMessagePreview returns empty without body or attachment', () => {
    expect(chatMessagePreview({ body: '  ', attachment: null })).toBe('');
  });

  it('uploadChatAttachment throws parsed JSON message', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: ['Too large', 'Bad type'] }),
    }) as typeof fetch;

    const file = new File(['x'], 'big.bin', { type: 'application/octet-stream' });
    await expect(uploadChatAttachment('conv-1', file)).rejects.toThrow('Too large, Bad type');
    global.fetch = originalFetch;
  });

  it('uploadChatAttachment throws plain text body on parse failure', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Server error',
    }) as typeof fetch;

    await expect(
      uploadChatAttachment('conv-1', new File(['x'], 'a.txt', { type: 'text/plain' })),
    ).rejects.toThrow('Server error');
    global.fetch = originalFetch;
  });
});
