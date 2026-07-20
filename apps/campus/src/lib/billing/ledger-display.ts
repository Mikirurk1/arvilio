import type { LessonBalanceLedgerEntryDto } from '@pkg/types';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, HandCoins, RotateCcw, ShoppingBag } from 'lucide-react';
import type { TranslateFn } from '../cms/nav-i18n';

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

const LEDGER_KIND_STATIC: Record<string, Omit<LedgerKindMeta, 'title' | 'description'> & { title: string; description: string }> = {
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
  GROUP_CHARGE: {
    title: 'Group lesson charge',
    description: 'Fixed group lesson fee recorded for your account.',
    icon: BookOpen,
    tone: 'debit',
  },
  GROUP_CHARGE_REVERSAL: {
    title: 'Group lesson charge reversed',
    description: 'A group lesson fee was reversed.',
    icon: RotateCcw,
    tone: 'credit',
  },
  GROUP_PURCHASE: {
    title: 'Group lesson package purchased',
    description: 'Group lesson credits added after a successful online payment.',
    icon: ShoppingBag,
    tone: 'credit',
  },
  GROUP_MANUAL_CREDIT: {
    title: 'Group lesson manual top-up',
    description: 'Group lesson credits added by your school.',
    icon: HandCoins,
    tone: 'credit',
  },
  GROUP_CONSUMPTION: {
    title: 'Group lesson completed',
    description: 'One group lesson credit deducted from your prepaid balance.',
    icon: BookOpen,
    tone: 'debit',
  },
  GROUP_REVERSAL: {
    title: 'Group lesson charge reversed',
    description: 'A previously charged group lesson was returned to your balance.',
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

export function getLedgerKindMeta(kind: string, t?: TranslateFn): LedgerKindMeta {
  const base = LEDGER_KIND_STATIC[kind];
  if (!base) {
    if (t) {
      return {
        title: t('payment.ledger.kind.fallback.title'),
        description: t('payment.ledger.kind.fallback.desc'),
        icon: FALLBACK_META.icon,
        tone: FALLBACK_META.tone,
      };
    }
    return { ...FALLBACK_META, title: kind.replace(/_/g, ' ').toLowerCase() };
  }
  if (!t) return base;
  return {
    title: t(`payment.ledger.kind.${kind}.title`),
    description: t(`payment.ledger.kind.${kind}.desc`),
    icon: base.icon,
    tone: base.tone,
  };
}

function lessonUnit(count: number, t?: TranslateFn): string {
  if (Math.abs(count) === 1) return t?.('payment.ledger.lesson') ?? 'lesson';
  return t?.('payment.ledger.lessons') ?? 'lessons';
}

export function formatLedgerDelta(delta: number, t?: TranslateFn): string {
  const unit = lessonUnit(delta, t);
  if (delta > 0) return `+${delta} ${unit}`;
  if (delta < 0) return `${delta} ${unit}`;
  return `0 ${unit}`;
}

export function formatLedgerBalanceAfter(balanceAfter: number, t?: TranslateFn): string {
  const unit = lessonUnit(balanceAfter, t);
  if (t) return t('payment.ledger.left', { count: balanceAfter, unit });
  return `${balanceAfter} ${unit} left`;
}

export function formatLedgerWhen(
  iso: string,
  locale = 'en',
  labels?: { today: string; yesterday: string },
): { label: string; title: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { label: iso.slice(0, 10), title: iso };
  }

  const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  const todayLabel = labels?.today ?? 'Today';
  const yesterdayLabel = labels?.yesterday ?? 'Yesterday';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  const time = new Intl.DateTimeFormat(dateLocale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  const full = new Intl.DateTimeFormat(dateLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (dayDiff === 0) return { label: `${todayLabel} · ${time}`, title: full };
  if (dayDiff === 1) return { label: `${yesterdayLabel} · ${time}`, title: full };
  if (dayDiff < 7) {
    const weekday = new Intl.DateTimeFormat(dateLocale, { weekday: 'short' }).format(date);
    return { label: `${weekday} · ${time}`, title: full };
  }

  const label = new Intl.DateTimeFormat(dateLocale, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  }).format(date);

  return { label, title: full };
}

export function groupLedgerByDay(
  entries: LessonBalanceLedgerEntryDto[],
  locale = 'en',
  labels?: { today: string; yesterday: string },
): Array<{ dayKey: string; dayLabel: string; entries: LessonBalanceLedgerEntryDto[] }> {
  const groups = new Map<string, LessonBalanceLedgerEntryDto[]>();
  const dayLabels = new Map<string, string>();
  const dateLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  const todayLabel = labels?.today ?? 'Today';
  const yesterdayLabel = labels?.yesterday ?? 'Yesterday';

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
      if (dayDiff === 0) dayLabel = todayLabel;
      else if (dayDiff === 1) dayLabel = yesterdayLabel;
      else {
        dayLabel = new Intl.DateTimeFormat(dateLocale, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        }).format(date);
      }
      dayLabels.set(dayKey, dayLabel);
    }
    groups.get(dayKey)!.push(entry);
  }

  return [...groups.entries()].map(([dayKey, dayEntries]) => ({
    dayKey,
    dayLabel: dayLabels.get(dayKey) ?? dayKey,
    entries: dayEntries,
  }));
}
