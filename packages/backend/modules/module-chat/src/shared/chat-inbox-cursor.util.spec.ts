import { BadRequestException } from '@nestjs/common';
import { decodeInboxCursor, encodeInboxCursor } from './chat-inbox-cursor.util';

describe('chat-inbox-cursor.util', () => {
  it('round-trips updatedAt and id', () => {
    const updatedAt = new Date('2026-05-20T12:00:00.000Z');
    const cursor = encodeInboxCursor({ updatedAt, id: 'conv-1' });
    expect(decodeInboxCursor(cursor)).toEqual({ updatedAt, id: 'conv-1' });
  });

  it('decodeInboxCursor rejects malformed cursor', () => {
    expect(() => decodeInboxCursor('bad')).toThrow(BadRequestException);
    expect(() => decodeInboxCursor('only-one-part')).toThrow(BadRequestException);
  });
});
