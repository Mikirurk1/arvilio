import { BadRequestException } from '@nestjs/common';

export function encodeInboxCursor(row: { updatedAt: Date; id: string }): string {
  return `${row.updatedAt.toISOString()}|${row.id}`;
}

export function decodeInboxCursor(cursor: string): { updatedAt: Date; id: string } {
  const parts = cursor.split('|');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new BadRequestException('Invalid inbox cursor');
  }
  return { updatedAt: new Date(parts[0]), id: parts[1] };
}
