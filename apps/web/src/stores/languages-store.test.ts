import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import {
  selectEnglishLanguageId,
  selectLanguagesList,
  useLanguagesStore,
} from './languages-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const english = { id: 'en-id', code: 'en', name: 'English' };
const ukrainian = { id: 'uk-id', code: 'uk', name: 'Ukrainian' };

describe('languages-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLanguagesStore.setState({
      languages: createIdleSlice(),
    });
  });

  it('fetchLanguages loads languages', async () => {
    mockGraphql.mockResolvedValue({ languages: [english] });
    await useLanguagesStore.getState().fetchLanguages();
    expect(useLanguagesStore.getState().languages.status).toBe('success');
    expect(selectEnglishLanguageId(useLanguagesStore.getState())).toBe('en-id');
  });

  it('fetchLanguages skips warm cache', async () => {
    useLanguagesStore.setState({ languages: sliceSuccess(createIdleSlice(), [english]) });
    await useLanguagesStore.getState().fetchLanguages();
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchLanguages records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Network'));
    await useLanguagesStore.getState().fetchLanguages();
    expect(useLanguagesStore.getState().languages.status).toBe('error');
  });

  it('languageById resolves by id', async () => {
    useLanguagesStore.setState({
      languages: sliceSuccess(createIdleSlice(), [english, ukrainian]),
    });
    expect(useLanguagesStore.getState().languageById('uk-id')).toEqual(ukrainian);
    expect(useLanguagesStore.getState().languageById(null)).toBeUndefined();
  });

  it('selectLanguagesList returns stable empty array when idle', () => {
    const first = selectLanguagesList(useLanguagesStore.getState());
    const second = selectLanguagesList(useLanguagesStore.getState());
    expect(first).toEqual([]);
    expect(first).toBe(second);
  });

  it('englishLanguageId returns english code id', () => {
    useLanguagesStore.setState({
      languages: sliceSuccess(createIdleSlice(), [ukrainian, english]),
    });
    expect(useLanguagesStore.getState().englishLanguageId()).toBe('en-id');
  });
});
