import { format, parseISO } from 'date-fns';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

/** Parse `YYYY-MM-DD` to UTC noon (stable calendar day). */
export function parseDateKey(value: string): Date | undefined {
  if (!DATE_KEY_RE.test(value)) return undefined;
  const parsed = parseISO(`${value}T12:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDateLabel(value: string, placeholder = 'Select date'): string {
  if (!value) return placeholder;
  const parsed = parseDateKey(value);
  if (!parsed) return value;
  return format(parsed, 'd MMM yyyy');
}

export function parseTimeValue(value: string): { hour: number; minute: number } | undefined {
  const match = TIME_RE.exec(value.trim());
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
  return { hour, minute };
}

export function formatTimeValue(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatTimeLabel(value: string, placeholder = 'Select time'): string {
  const parsed = parseTimeValue(value);
  if (!parsed) return value || placeholder;
  return formatTimeValue(parsed.hour, parsed.minute);
}

export const TIME_MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => index * 5);

export const TIME_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
