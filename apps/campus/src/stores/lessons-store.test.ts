import { mockScheduledLessonBackend } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { LESSONS_PAGE_SIZE, useLessonsStore } from './lessons-store';

const mockGraphql = jest.fn();
const mockApiPatch = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

jest.mock('../lib/api', () => ({
  apiClient: {
    patch: (...args: unknown[]) => mockApiPatch(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
}));

const lesson = mockScheduledLessonBackend({ id: 'l1', title: 'Lesson' });
const lesson2 = mockScheduledLessonBackend({ id: 'l2', title: 'Lesson 2' });

describe('lessons-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLessonsStore.setState({
      backendLessons: createIdleSlice(),
      lessonsPage: {
        items: [],
        hasMore: false,
        nextCursor: null,
        status: 'idle',
        error: null,
        loadingMore: false,
      },
    });
  });

  it('exports page size constant', () => {
    expect(LESSONS_PAGE_SIZE).toBe(25);
  });

  it('fetchScheduledLessons loads lessons', async () => {
    mockGraphql.mockResolvedValue({ scheduledLessons: [lesson] });
    await useLessonsStore.getState().fetchScheduledLessons(true);
    expect(useLessonsStore.getState().backendLessons.status).toBe('success');
    expect(useLessonsStore.getState().backendLessons.data).toEqual([lesson]);
  });

  it('fetchScheduledLessons skips when cache is warm', async () => {
    useLessonsStore.setState({
      backendLessons: sliceSuccess(createIdleSlice(), [lesson]),
    });
    await useLessonsStore.getState().fetchScheduledLessons(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchScheduledLessons records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Network'));
    await useLessonsStore.getState().fetchScheduledLessons(true);
    expect(useLessonsStore.getState().backendLessons.status).toBe('error');
  });

  it('fetchLessonsPage loads paginated items', async () => {
    mockGraphql.mockResolvedValue({
      scheduledLessonsPage: {
        items: [lesson],
        hasMore: true,
        nextCursor: 'c2',
      },
    });
    await useLessonsStore.getState().fetchLessonsPage(true);
    const page = useLessonsStore.getState().lessonsPage;
    expect(page.status).toBe('success');
    expect(page.items).toEqual([lesson]);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe('c2');
  });

  it('loadMoreLessonsPage appends unique items', async () => {
    useLessonsStore.setState({
      lessonsPage: {
        items: [lesson],
        hasMore: true,
        nextCursor: 'c2',
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    mockGraphql.mockResolvedValue({
      scheduledLessonsPage: {
        items: [lesson, lesson2],
        hasMore: false,
        nextCursor: null,
      },
    });
    await useLessonsStore.getState().loadMoreLessonsPage();
    expect(useLessonsStore.getState().lessonsPage.items).toEqual([lesson, lesson2]);
  });

  it('createScheduledLesson prepends to cache and refreshes page', async () => {
    useLessonsStore.setState({
      lessonsPage: {
        items: [],
        hasMore: false,
        nextCursor: null,
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    mockGraphql
      .mockResolvedValueOnce({ createScheduledLesson: lesson2 })
      .mockResolvedValueOnce({
        scheduledLessonsPage: { items: [lesson, lesson2], hasMore: false, nextCursor: null },
      });
    const created = await useLessonsStore.getState().createScheduledLesson({ title: 'Lesson 2' } as never);
    expect(created).toEqual(lesson2);
    expect(useLessonsStore.getState().backendLessons.data).toEqual([lesson2]);
  });

  it('updateScheduledLesson patches cached rows', async () => {
    const updated = { ...lesson, title: 'Updated' };
    useLessonsStore.setState({
      backendLessons: sliceSuccess(createIdleSlice(), [lesson]),
      lessonsPage: {
        items: [lesson],
        hasMore: false,
        nextCursor: null,
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    mockApiPatch.mockResolvedValue(updated);
    const result = await useLessonsStore.getState().updateScheduledLesson('l1', { title: 'Updated' });
    expect(result).toEqual(updated);
    expect(useLessonsStore.getState().backendLessons.data?.[0].title).toBe('Updated');
    expect(useLessonsStore.getState().lessonsPage.items[0].title).toBe('Updated');
  });

  it('deleteScheduledLesson removes lesson from caches', async () => {
    useLessonsStore.setState({
      backendLessons: sliceSuccess(createIdleSlice(), [lesson, lesson2]),
      lessonsPage: {
        items: [lesson, lesson2],
        hasMore: false,
        nextCursor: null,
        status: 'success',
        error: null,
        loadingMore: false,
      },
    });
    mockApiDelete.mockResolvedValue(undefined);
    await useLessonsStore.getState().deleteScheduledLesson('l1');
    expect(useLessonsStore.getState().backendLessons.data).toEqual([lesson2]);
    expect(useLessonsStore.getState().lessonsPage.items).toEqual([lesson2]);
  });
});
