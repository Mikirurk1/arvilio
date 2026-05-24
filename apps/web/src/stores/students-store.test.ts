import { mockStudentSummary } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { useStudentsStore } from './students-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const student = mockStudentSummary({ id: 's1', displayName: 'Student', email: 's@test.local' });

describe('students-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStudentsStore.setState({
      list: createIdleSlice(),
    });
  });

  it('fetchStudents loads list', async () => {
    mockGraphql.mockResolvedValue({ students: [student] });
    await useStudentsStore.getState().fetchStudents(true);
    expect(useStudentsStore.getState().list.status).toBe('success');
    expect(useStudentsStore.getState().list.data).toEqual([student]);
  });

  it('fetchStudents skips warm cache', async () => {
    useStudentsStore.setState({ list: sliceSuccess(createIdleSlice(), [student]) });
    await useStudentsStore.getState().fetchStudents(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchStudents records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Forbidden'));
    await useStudentsStore.getState().fetchStudents(true);
    expect(useStudentsStore.getState().list.status).toBe('error');
  });

  it('updateStudentAdmin mutates and refreshes list', async () => {
    mockGraphql
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ students: [{ ...student, displayName: 'Updated' }] });
    await useStudentsStore.getState().updateStudentAdmin('s1', {
      nativeLanguageId: 'lang-uk',
      learningLanguageIds: ['lang-en'],
    });
    expect(mockGraphql).toHaveBeenCalledTimes(2);
    expect(useStudentsStore.getState().list.data?.[0]?.displayName).toBe('Updated');
  });
});
