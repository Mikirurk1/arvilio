import { mockPracticeWeekSummary } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { usePracticeStore } from './practice-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const summary = mockPracticeWeekSummary({ practiceMinutes: 10 });

describe('practice-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePracticeStore.setState({
      weekSummary: createIdleSlice(),
    });
  });

  it('fetchWeekSummary loads summary', async () => {
    mockGraphql.mockResolvedValue({ practiceWeekSummary: summary });
    await usePracticeStore.getState().fetchWeekSummary(true);
    expect(usePracticeStore.getState().weekSummary.status).toBe('success');
    expect(usePracticeStore.getState().weekSummary.data).toEqual(summary);
  });

  it('fetchWeekSummary skips warm cache', async () => {
    usePracticeStore.setState({ weekSummary: sliceSuccess(createIdleSlice(), summary) });
    await usePracticeStore.getState().fetchWeekSummary(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchWeekSummary records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Network'));
    await usePracticeStore.getState().fetchWeekSummary(true);
    expect(usePracticeStore.getState().weekSummary.status).toBe('error');
  });

  it('recordSession posts session and refreshes summary', async () => {
    mockGraphql
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ practiceWeekSummary: mockPracticeWeekSummary({ practiceMinutes: 20 }) });
    const input = {
      kind: 'vocabulary' as const,
      startedAt: '2026-05-20T10:00:00.000Z',
      endedAt: '2026-05-20T10:15:00.000Z',
    };
    await usePracticeStore.getState().recordSession(input);
    expect(mockGraphql).toHaveBeenNthCalledWith(1, expect.anything(), {
      input: { ...input, source: 'practice' },
    });
    expect(usePracticeStore.getState().weekSummary.data?.practiceMinutes).toBe(20);
  });
});
