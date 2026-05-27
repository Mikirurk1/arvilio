import type { LessonBalanceLedgerEntryDto } from '@pkg/types';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, HandCoins, RotateCcw, ShoppingBag } from 'lucide-react';

export type LedgerKindKey =
  | 'PURCHASE'
  | 'MANUAL_CREDIT'
  | 'CONSUMPTION'
  | 'REVERSAL'
  | (string & {});

export type LedgerKindMeta = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: 'credit' | 'debit' | 'neutral';
};

const LEDGER_KIND_META: Record<string, LedgerKindMeta> = {
  PURCHASE: {
    title: 'Lesson package purchased',
    description: 'Lessons added after a successful online payment.',
    icon: ShoppingBag,
    tone: 'credit',
  },
  MANUAL_CREDIT: {
    title: 'Manual top-up',
    description: 'Lessons credited by your school.',
    icon: HandCoins,
    tone: 'credit',
  },
  CONSUMPTION: {
    title: 'Lesson completed',
    description: 'One lesson deducted from your prepaid balance.',
    icon: BookOpen,
    tone: 'debit',
  },
  REVERSAL: {
    title: 'Lesson charge reversed',
    description: 'A previously charged lesson was returned to your balance.',
    icon: RotateCcw,
    tone: 'credit',
  },
};

const FALLBACK_META: LedgerKindMeta = {
  title: 'Balance adjustment',
  description: 'Your lesson balance was updated.',
  icon: RotateCcw,
  tone: 'neutral',
};

export function getLedgerKindMeta(kind: string): LedgerKindMeta {
  return LEDGER_KIND_META[kind] ?? { ...FALLBACK_META, title: kind.replace(/_/g, ' ').toLowerCase() };
}

export function formatLedgerDelta(delta: number): string {
  const abs = Math.abs(delta);
  const unit = abs === 1 ? 'lesson' : 'lessons';
  if (delta > 0) return `+${delta} ${unit}`;
  if (delta < 0) return `${delta} ${unit}`;
  return `0 ${unit}`;
}

export function formatLedgerBalanceAfter(balanceAfter: number): string {
  const abs = Math.abs(balanceAfter);
  const unit = abs === 1 ? 'lesson' : 'lessons';
  return `${balanceAfter} ${unit} left`;
}

export function formatLedgerWhen(iso: string): { label: string; title: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { label: iso.slice(0, 10), title: iso };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  const full = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (dayDiff === 0) return { label: `Today · ${time}`, title: full };
  if (dayDiff === 1) return { label: `Yesterday · ${time}`, title: full };
  if (dayDiff < 7) {
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
    return { label: `${weekday} · ${time}`, title: full };
  }

  const label = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);

  return { label, title: full };
}

export function groupLedgerByDay(
  entries: LessonBalanceLedgerEntryDto[],
): Array<{ dayKey: string; dayLabel: string; entries: LessonBalanceLedgerEntryDto[] }> {
  const groups = new Map<string, LessonBalanceLedgerEntryDto[]>();
  const labels = new Map<string, string>();

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const dayKey = Number.isNaN(date.getTime())
      ? entry.createdAt.slice(0, 10)
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!groups.has(dayKey)) {
      groups.set(dayKey, []);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfDate = Number.isNaN(date.getTime())
        ? startOfToday
        : new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

      let dayLabel: string;
      if (dayDiff === 0) dayLabel = 'Today';
      else if (dayDiff === 1) dayLabel = 'Yesterday';
      else {
        dayLabel = new Intl.DateTimeFormat(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        }).format(date);
      }
      labels.set(dayKey, dayLabel);
    }
    groups.get(dayKey)!.push(entry);
  }

  return [...groups.entries()].map(([dayKey, dayEntries]) => ({
    dayKey,
    dayLabel: labels.get(dayKey) ?? dayKey,
    entries: dayEntries,
  }));
}
