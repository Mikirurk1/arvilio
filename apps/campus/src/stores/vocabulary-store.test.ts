import { mockStudentWordCard, mockWordCard, mockWordLookupResult } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { createIdlePaginatedSlice } from './lib/paginated-slice';
import { loadInitialPage, loadNextPage } from './lib/paginated-api';
import { useVocabularyStore } from './vocabulary-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
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

const card = mockStudentWordCard({
  id: 'c1',
  word: mockWordCard({ id: 'w1', text: 'hello', definition: 'greeting' }),
  status: 'repeated',
});

describe('vocabulary-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useVocabularyStore.setState({
      overview: createIdleSlice(),
      cards: createIdleSlice(),
      cardsStudentId: null,
      cardsPage: createIdlePaginatedSlice(),
      cardsPageStudentId: null,
    });
  });

  it('fetchOverview loads data', async () => {
    mockGraphql.mockResolvedValue({ vocabularyOverview: { totalWords: 1 } });
    await useVocabularyStore.getState().fetchOverview(true);
    expect(useVocabularyStore.getState().overview.status).toBe('success');
  });

  it('fetchOverview skips warm cache', async () => {
    useVocabularyStore.setState({
      overview: sliceSuccess(createIdleSlice(), { totalWords: 5 } as never),
    });
    await useVocabularyStore.getState().fetchOverview(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchCards loads student vocabulary', async () => {
    mockGraphql.mockResolvedValue({ studentVocabulary: [card] });
    await useVocabularyStore.getState().fetchCards('s1', true);
    expect(useVocabularyStore.getState().cards.data).toEqual([card]);
    expect(useVocabularyStore.getState().cardsStudentId).toBe('s1');
  });

  it('fetchCardsPage loads paginated cards', async () => {
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [card],
      hasMore: true,
      nextCursor: 'c2',
    });
    await useVocabularyStore.getState().fetchCardsPage('s1', true);
    expect(useVocabularyStore.getState().cardsPage.status).toBe('success');
    expect(useVocabularyStore.getState().cardsPageStudentId).toBe('s1');
  });

  it('loadMoreCardsPage merges next page', async () => {
    useVocabularyStore.setState({
      cardsPage: {
        items: [card],
        hasMore: true,
        nextCursor: 'c2',
        status: 'success',
        error: null,
        loadingMore: false,
      },
      cardsPageStudentId: 's1',
    });
    (loadNextPage as jest.Mock).mockResolvedValue({
      items: [{ ...card, id: 'c2' }],
      hasMore: false,
      nextCursor: null,
    });
    await useVocabularyStore.getState().loadMoreCardsPage();
    expect(useVocabularyStore.getState().cardsPage.items).toHaveLength(2);
  });

  it('lookupWord trims and returns result', async () => {
    mockGraphql.mockResolvedValue({
      lookupWord: mockWordLookupResult({ foundInDb: true, foundInDictionary: true }),
    });
    const result = await useVocabularyStore.getState().lookupWord('  hello  ');
    expect(result.foundInDb).toBe(true);
    expect(mockGraphql).toHaveBeenCalledWith(expect.anything(), { text: 'hello' });
  });

  it('fetchWordsByIds returns empty for no ids', async () => {
    await expect(useVocabularyStore.getState().fetchWordsByIds([])).resolves.toEqual([]);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchWordsByIds loads words', async () => {
    mockGraphql.mockResolvedValue({ wordsByIds: [{ id: 'w1', text: 'hello' }] });
    const words = await useVocabularyStore.getState().fetchWordsByIds(['w1']);
    expect(words).toHaveLength(1);
  });

  it('addCard refreshes overview and cards', async () => {
    mockGraphql
      .mockResolvedValueOnce({ addStudentWordCard: card })
      .mockResolvedValueOnce({ studentVocabulary: [card] })
      .mockResolvedValueOnce({ vocabularyOverview: { totalWords: 1 } });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [card],
      hasMore: false,
      nextCursor: null,
    });
    const created = await useVocabularyStore.getState().addCard(
      { text: 'hello', status: 'repeated' },
      's1',
    );
    expect(created).toEqual(card);
    expect(useVocabularyStore.getState().cards.status).toBe('success');
  });

  it('updateCardStatus refreshes cards', async () => {
    mockGraphql
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ studentVocabulary: [{ ...card, status: 'learned' }] });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [{ ...card, status: 'learned' }],
      hasMore: false,
      nextCursor: null,
    });
    await useVocabularyStore.getState().updateCardStatus('c1', 'learned', 's1');
    expect(useVocabularyStore.getState().cards.data?.[0]?.status).toBe('learned');
  });

  it('deleteCard refreshes caches', async () => {
    useVocabularyStore.setState({
      cards: sliceSuccess(createIdleSlice(), [card]),
      overview: sliceSuccess(createIdleSlice(), { totalWords: 1 } as never),
    });
    mockGraphql
      .mockResolvedValueOnce({ deleteStudentWordCard: true })
      .mockResolvedValueOnce({ studentVocabulary: [] })
      .mockResolvedValueOnce({ vocabularyOverview: { totalWords: 0 } });
    (loadInitialPage as jest.Mock).mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    await useVocabularyStore.getState().deleteCard('c1', 's1');
    expect(useVocabularyStore.getState().cards.data).toEqual([]);
  });
});
