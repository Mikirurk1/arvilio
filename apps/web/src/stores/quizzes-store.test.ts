import { mockQuizCard, mockStudentQuizCard } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { createIdlePaginatedSlice } from './lib/paginated-slice';
import { loadInitialPage, loadNextPage } from './lib/paginated-api';
import { useQuizzesStore } from './quizzes-store';

const mockGraphql = jest.fn();
const mockApiPost = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

jest.mock('../lib/api', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

jest.mock('./lib/paginated-api', () => ({
  loadInitialPage: jest.fn(),
  loadNextPage: jest.fn(),
  mergePageItems: jest.fn((page, next) => ({
    ...page,
    items: [...page.items, ...next.items],
    hasMore: next.hasMore,
    nextCursor: next.nextCursor,
    loadingMore: false,
  })),
}));

const quiz = mockQuizCard({ id: 'q1', title: 'Quiz' });
const studentQuiz = mockStudentQuizCard({ id: 'sq1', title: 'Student quiz' });

describe('quizzes-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useQuizzesStore.setState({
      list: createIdleSlice(),
      listPage: createIdlePaginatedSlice(),
      studentQuizzes: createIdleSlice(),
      studentQuizzesPage: createIdlePaginatedSlice(),
      studentQuizzesStudentId: null,
      generating: false,
      generateError: null,
    });
  });

  it('fetchList loads quizzes', async () => {
    mockGraphql.mockResolvedValue({ quizzes: [quiz] });
    await useQuizzesStore.getState().fetchList(true);
    expect(useQuizzesStore.getState().list.status).toBe('success');
    expect(useQuizzesStore.getState().list.data).toEqual([quiz]);
  });

  it('fetchList skips warm cache', async () => {
    useQuizzesStore.setState({ list: sliceSuccess(createIdleSlice(), [quiz]) });
    await useQuizzesStore.getState().fetchList(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchListPage loads paginated quizzes', async () => {
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [quiz],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().fetchListPage(true);
    expect(useQuizzesStore.getState().listPage.status).toBe('success');
    expect(useQuizzesStore.getState().listPage.items).toEqual([quiz]);
  });

  it('loadMoreListPage merges next page', async () => {
    useQuizzesStore.setState({
      listPage: {
        items: [quiz],
        hasMore: true,
        nextCursor: 'c2',
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    (loadNextPage as jest.Mock).mockResolvedValue({
      items: [{ id: 'q2', title: 'Quiz 2' }],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().loadMoreListPage();
    expect(useQuizzesStore.getState().listPage.items).toHaveLength(2);
  });

  it('fetchStudentQuizzes loads for student', async () => {
    mockGraphql.mockResolvedValue({ studentQuizzes: [studentQuiz] });
    await useQuizzesStore.getState().fetchStudentQuizzes('s1', true);
    expect(useQuizzesStore.getState().studentQuizzes.data).toEqual([studentQuiz]);
    expect(useQuizzesStore.getState().studentQuizzesStudentId).toBe('s1');
  });

  it('fetchQuiz normalizes questions', async () => {
    mockGraphql.mockResolvedValue({
      quiz: { id: 'q1', title: 'Quiz', questions: [{ id: 'qq1', prompt: '?' }] },
    });
    const detail = await useQuizzesStore.getState().fetchQuiz('q1');
    expect(detail.questions).toHaveLength(1);
  });

  it('generateQuiz refreshes list on success', async () => {
    mockApiPost.mockResolvedValue({ id: 'q2', title: 'New', questions: [] });
    mockGraphql.mockResolvedValue({ quizzes: [quiz, { id: 'q2', title: 'New' }] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [quiz, { id: 'q2', title: 'New' }],
      hasMore: false,
      nextCursor: null,
    });
    const detail = await useQuizzesStore.getState().generateQuiz({ wordCount: 5 } as never);
    expect(detail.id).toBe('q2');
    expect(useQuizzesStore.getState().generating).toBe(false);
  });

  it('generateQuiz records error', async () => {
    mockApiPost.mockRejectedValue(new Error('Failed'));
    await expect(useQuizzesStore.getState().generateQuiz({ wordCount: 5 } as never)).rejects.toThrow(
      'Failed',
    );
    expect(useQuizzesStore.getState().generateError).toBe('Failed');
    expect(useQuizzesStore.getState().generating).toBe(false);
  });

  it('submitQuizAttempt patches list optimistically', async () => {
    useQuizzesStore.setState({
      list: sliceSuccess(createIdleSlice(), [quiz]),
    });
    mockGraphql
      .mockResolvedValueOnce({
        submitQuizAttempt: {
          attemptId: 'a1',
          score: 80,
          correctCount: 4,
          totalCount: 5,
        },
      })
      .mockResolvedValueOnce({
        quizzes: [
          {
            ...quiz,
            attempt: {
              id: 'a1',
              score: 80,
              correctCount: 4,
              totalCount: 5,
              finishedAt: '2026-01-01T00:00:00.000Z',
            },
          },
        ],
      });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [quiz],
      hasMore: false,
      nextCursor: null,
    });
    const result = await useQuizzesStore.getState().submitQuizAttempt({
      quizId: 'q1',
      answers: [],
      practiceMode: false,
    } as never);
    expect(result.score).toBe(80);
    expect(useQuizzesStore.getState().list.data?.[0].attempt?.score).toBe(80);
  });

  it('fetchList records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Network'));
    await useQuizzesStore.getState().fetchList(true);
    expect(useQuizzesStore.getState().list.status).toBe('error');
  });

  it('fetchListPage skips warm cache', async () => {
    useQuizzesStore.setState({
      listPage: {
        items: [quiz],
        hasMore: false,
        nextCursor: null,
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    await useQuizzesStore.getState().fetchListPage(false);
    expect(loadInitialPage).not.toHaveBeenCalled();
  });

  it('fetchListPage records errors', async () => {
    (loadInitialPage as jest.Mock).mockRejectedValue(new Error('Failed'));
    await useQuizzesStore.getState().fetchListPage(true);
    expect(useQuizzesStore.getState().listPage.status).toBe('error');
  });

  it('loadMoreListPage no-ops when not ready', async () => {
    await useQuizzesStore.getState().loadMoreListPage();
    expect(loadNextPage).not.toHaveBeenCalled();
  });

  it('fetchStudentQuizzes skips warm cache for same student', async () => {
    useQuizzesStore.setState({
      studentQuizzes: sliceSuccess(createIdleSlice(), [studentQuiz]),
      studentQuizzesStudentId: 's1',
    });
    await useQuizzesStore.getState().fetchStudentQuizzes('s1', false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchStudentQuizzesPage loads paginated student quizzes', async () => {
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [studentQuiz],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().fetchStudentQuizzesPage('s1', true);
    expect(useQuizzesStore.getState().studentQuizzesPage.status).toBe('success');
  });

  it('loadMoreStudentQuizzesPage merges pages', async () => {
    useQuizzesStore.setState({
      studentQuizzesStudentId: 's1',
      studentQuizzesPage: {
        items: [studentQuiz],
        hasMore: true,
        nextCursor: 'c2',
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    (loadNextPage as jest.Mock).mockResolvedValue({
      items: [{ id: 'sq2', title: 'Quiz 2' }],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().loadMoreStudentQuizzesPage();
    expect(useQuizzesStore.getState().studentQuizzesPage.items).toHaveLength(2);
  });

  it('generateQuiz refreshes student lists when studentId set', async () => {
    mockApiPost.mockResolvedValue({ id: 'q3', title: 'For student', questions: [] });
    mockGraphql.mockResolvedValue({ studentQuizzes: [studentQuiz] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [studentQuiz],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().generateQuiz({ studentId: 's1', wordCount: 3 } as never);
    expect(mockGraphql).toHaveBeenCalled();
  });

  it('deleteQuiz refreshes global list', async () => {
    mockGraphql.mockResolvedValue({ quizzes: [] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().deleteQuiz('q1');
    expect(mockGraphql).toHaveBeenCalled();
  });

  it('deleteQuiz refreshes student quizzes when studentId provided', async () => {
    mockGraphql.mockResolvedValue({ studentQuizzes: [] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    await useQuizzesStore.getState().deleteQuiz('q1', 's1');
    expect(mockGraphql).toHaveBeenCalled();
  });

  it('submitQuizAttempt in practiceMode skips cache refresh', async () => {
    mockGraphql.mockResolvedValue({
      submitQuizAttempt: { score: 50, correctCount: 1, totalCount: 2 },
    });
    const result = await useQuizzesStore.getState().submitQuizAttempt({
      quizId: 'q1',
      answers: [],
      practiceMode: true,
    } as never);
    expect(result.score).toBe(50);
    expect(mockGraphql).toHaveBeenCalledTimes(1);
  });

  it('fetchStudentQuizzes records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Forbidden'));
    await useQuizzesStore.getState().fetchStudentQuizzes('s1', true);
    expect(useQuizzesStore.getState().studentQuizzes.status).toBe('error');
  });

  it('fetchStudentQuizzesPage records errors', async () => {
    (loadInitialPage as jest.Mock).mockRejectedValue(new Error('Failed'));
    await useQuizzesStore.getState().fetchStudentQuizzesPage('s1', true);
    expect(useQuizzesStore.getState().studentQuizzesPage.status).toBe('error');
  });

  it('submitQuizAttempt patches student list and page optimistically', async () => {
    useQuizzesStore.setState({
      studentQuizzesStudentId: 's1',
      studentQuizzes: sliceSuccess(createIdleSlice(), [studentQuiz]),
      studentQuizzesPage: {
        items: [studentQuiz],
        hasMore: false,
        nextCursor: null,
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    const patchedStudentQuiz = {
      ...studentQuiz,
      attempt: { id: 'a1', score: 90, correctCount: 9, totalCount: 10, finishedAt: '2026-01-01' },
    };
    mockGraphql
      .mockResolvedValueOnce({
        submitQuizAttempt: {
          attemptId: 'a1',
          score: 90,
          correctCount: 9,
          totalCount: 10,
        },
      })
      .mockResolvedValueOnce({ studentQuizzes: [patchedStudentQuiz] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [patchedStudentQuiz],
      hasMore: false,
      nextCursor: null,
    });

    await useQuizzesStore.getState().submitQuizAttempt({
      quizId: 'sq1',
      studentId: 's1',
      answers: [],
      practiceMode: false,
    } as never);

    expect(useQuizzesStore.getState().studentQuizzes.data?.[0]?.attempt?.score).toBe(90);
    expect(useQuizzesStore.getState().studentQuizzesPage.items[0]?.attempt?.score).toBe(90);
  });
});
