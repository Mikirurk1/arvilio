import {
  formatLedgerDelta,
  formatLedgerWhen,
  getLedgerKindMeta,
  groupLedgerByDay,
} from './ledger-display';

describe('ledger-display', () => {
  it('maps known ledger kinds to student-friendly titles', () => {
    expect(getLedgerKindMeta('PURCHASE').title).toBe('Lesson package purchased');
    expect(getLedgerKindMeta('CONSUMPTION').tone).toBe('debit');
  });

  it('formats delta with lesson units', () => {
    expect(formatLedgerDelta(3)).toBe('+3 lessons');
    expect(formatLedgerDelta(-1)).toBe('-1 lesson');
  });

  it('formats relative dates for today', () => {
    const now = new Date();
    const iso = now.toISOString();
    const { label, title } = formatLedgerWhen(iso);
    expect(label.startsWith('Today ·')).toBe(true);
    expect(title.length).toBeGreaterThan(label.length);
  });

  it('describes group monetary charges', () => {
    expect(getLedgerKindMeta('GROUP_CHARGE').title).toBe('Group lesson charge');
  });

  it('groups entries by calendar day', () => {
    const groups = groupLedgerByDay([
      {
        id: '1',
        delta: 1,
        balanceAfter: 2,
        kind: 'PURCHASE',
        note: null,
        createdAt: '2026-05-27T10:00:00.000Z',
        scheduledLessonId: null,
      },
      {
        id: '2',
        delta: -1,
        balanceAfter: 1,
        kind: 'CONSUMPTION',
        note: null,
        createdAt: '2026-05-26T10:00:00.000Z',
        scheduledLessonId: 'lesson-1',
      },
    ]);
    expect(groups).toHaveLength(2);
  });
});
