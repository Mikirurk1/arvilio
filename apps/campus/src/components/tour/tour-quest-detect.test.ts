import { isQuestActionSatisfied } from './tour-quest-detect';
import type { TourQuestDetect } from './tracks/types';

describe('isQuestActionSatisfied', () => {
  const empty = new Set<string>();

  it('matches pathname startsWith', () => {
    const detects: TourQuestDetect[] = [
      { kind: 'pathname', value: '/chat', match: 'startsWith' },
    ];
    expect(isQuestActionSatisfied(detects, '/chat', empty, 'stu-q-chat')).toBe(true);
    expect(isQuestActionSatisfied(detects, '/chat/thread-1', empty, 'stu-q-chat')).toBe(
      true,
    );
    expect(isQuestActionSatisfied(detects, '/uk/chat', empty, 'stu-q-chat')).toBe(true);
    expect(isQuestActionSatisfied(detects, '/dashboard', empty, 'stu-q-chat')).toBe(false);
  });

  it('matches pathname includes', () => {
    const detects: TourQuestDetect[] = [
      { kind: 'pathname', value: '/students/', match: 'includes' },
    ];
    expect(isQuestActionSatisfied(detects, '/students/abc', empty, 'x')).toBe(true);
  });

  it('matches signaled quest id', () => {
    const detects: TourQuestDetect[] = [
      { kind: 'event', value: 'practice_session_started' },
    ];
    const signaled = new Set(['stu-q-practice']);
    expect(
      isQuestActionSatisfied(detects, '/dashboard', signaled, 'stu-q-practice'),
    ).toBe(true);
  });

  it('matches signaled event id', () => {
    const detects: TourQuestDetect[] = [
      { kind: 'event', value: 'practice_session_started' },
    ];
    const signaled = new Set(['practice_session_started']);
    expect(
      isQuestActionSatisfied(detects, '/dashboard', signaled, 'stu-q-practice'),
    ).toBe(true);
  });
});
