import { BadRequestException } from '@nestjs/common';
import type { LessonFileLinkDto, ScheduledLessonBackendDto } from '@pkg/types';
import { lessonFileAttachmentId } from './lesson-attachment-ref.util';

export function encodeLessonCursor(row: { date: string; startTime: string; id: string }): string {
  return `${row.date}|${row.startTime}|${row.id}`;
}

export function decodeLessonCursor(cursor: string): { date: string; startTime: string; id: string } {
  const parts = cursor.split('|');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new BadRequestException('Invalid lesson cursor');
  }
  return { date: parts[0], startTime: parts[1], id: parts[2] };
}

export function statusToDto(
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED',
): ScheduledLessonBackendDto['status'] {
  return status.toLowerCase() as ScheduledLessonBackendDto['status'];
}

export function statusFromDto(
  status: ScheduledLessonBackendDto['status'],
): 'PLANNED' | 'COMPLETED' | 'CANCELLED' {
  return status.toUpperCase() as 'PLANNED' | 'COMPLETED' | 'CANCELLED';
}

export function cancelReasonToDto(
  reason: 'STUDENT_ABSENT' | 'STUDENT_REQUESTED_CANCEL' | 'TEACHER_ABSENT' | null,
): ScheduledLessonBackendDto['cancelReason'] {
  if (!reason) return null;
  return reason.toLowerCase() as ScheduledLessonBackendDto['cancelReason'];
}

export function cancelReasonFromDto(
  reason: NonNullable<ScheduledLessonBackendDto['cancelReason']>,
): 'STUDENT_ABSENT' | 'STUDENT_REQUESTED_CANCEL' | 'TEACHER_ABSENT' {
  return reason.toUpperCase() as 'STUDENT_ABSENT' | 'STUDENT_REQUESTED_CANCEL' | 'TEACHER_ABSENT';
}

export function recurrenceToDto(
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
): ScheduledLessonBackendDto['recurrence'] {
  return recurrence.toLowerCase() as ScheduledLessonBackendDto['recurrence'];
}

export function recurrenceFromDto(
  recurrence: ScheduledLessonBackendDto['recurrence'],
): 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' {
  return recurrence.toUpperCase() as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export function materialKindToDto(
  kind: 'TEXT' | 'PHOTO' | 'TEST' | 'FILE' | 'PRESENTATION',
): 'text' | 'photo' | 'test' | 'file' | 'presentation' {
  return kind.toLowerCase() as 'text' | 'photo' | 'test' | 'file' | 'presentation';
}

export function materialKindFromDto(
  kind: 'text' | 'photo' | 'test' | 'file' | 'presentation',
): 'TEXT' | 'PHOTO' | 'TEST' | 'FILE' | 'PRESENTATION' {
  return kind.toUpperCase() as 'TEXT' | 'PHOTO' | 'TEST' | 'FILE' | 'PRESENTATION';
}

export function studentResponseStatusToDto(
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'NEEDS_REWORK' | 'ACCEPTED',
): ScheduledLessonBackendDto['studentResponse']['status'] {
  return status.toLowerCase() as ScheduledLessonBackendDto['studentResponse']['status'];
}

export function studentResponseStatusFromDto(
  status: ScheduledLessonBackendDto['studentResponse']['status'],
): 'NOT_SUBMITTED' | 'SUBMITTED' | 'NEEDS_REWORK' | 'ACCEPTED' {
  return status.toUpperCase() as 'NOT_SUBMITTED' | 'SUBMITTED' | 'NEEDS_REWORK' | 'ACCEPTED';
}

export function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(mins)) return time;
  const total = hours * 60 + mins + minutes;
  const h = Math.floor((((total % (24 * 60)) + 24 * 60) % (24 * 60)) / 60);
  const m = ((total % 60) + 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function diffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map((part) => Number.parseInt(part, 10));
  const [eh, em] = end.split(':').map((part) => Number.parseInt(part, 10));
  if ([sh, sm, eh, em].some((value) => Number.isNaN(value))) return 0;
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function mapLessonFileLinks(
  files: string[],
  attachments: Array<{ id: string; fileName: string }>,
  downloadPath: (id: string) => string,
): LessonFileLinkDto[] {
  const byId = new Map(attachments.map((row) => [row.id, row]));
  return files.map((file) => {
    const attachmentId = lessonFileAttachmentId(file);
    if (attachmentId) {
      const row = byId.get(attachmentId);
      if (row) {
        return {
          ref: file,
          fileName: row.fileName,
          downloadPath: downloadPath(row.id),
        };
      }
    }
    return { ref: file, fileName: file, downloadPath: null };
  });
}
