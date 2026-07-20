import { mockAdminUserSummary, mockAuthUser, mockCreateAdminUserResult } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { useAdminStore } from './admin-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const user = mockAdminUserSummary({ id: 'a1', email: 'admin@test.local', role: 'admin' });

describe('admin-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminStore.setState({
      users: createIdleSlice(),
      mutating: false,
      mutationError: null,
    });
  });

  it('fetchUsers loads admin users', async () => {
    mockGraphql.mockResolvedValue({ adminUsers: [user] });
    await useAdminStore.getState().fetchUsers(true);
    expect(useAdminStore.getState().users.status).toBe('success');
    expect(useAdminStore.getState().users.data).toEqual([user]);
  });

  it('fetchUsers skips warm cache', async () => {
    useAdminStore.setState({ users: sliceSuccess(createIdleSlice(), [user]) });
    await useAdminStore.getState().fetchUsers(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchUsers records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Forbidden'));
    await useAdminStore.getState().fetchUsers(true);
    expect(useAdminStore.getState().users.status).toBe('error');
  });

  it('createUser refreshes list on success', async () => {
    mockGraphql
      .mockResolvedValueOnce({
        createAdminUser: mockCreateAdminUserResult({
          user: mockAuthUser({ id: user.id, email: user.email, displayName: user.displayName, role: 'admin' }),
          welcomeEmailSent: true,
        }),
      })
      .mockResolvedValueOnce({ adminUsers: [user] });
    const result = await useAdminStore.getState().createUser({
      email: 'admin@test.local',
      displayName: 'Admin',
      role: 'admin',
    } as never);
    expect(result.welcomeEmailSent).toBe(true);
    expect(useAdminStore.getState().mutating).toBe(false);
    expect(useAdminStore.getState().users.data).toEqual([user]);
  });

  it('createUser records mutation error', async () => {
    mockGraphql.mockRejectedValue(new Error('Email taken'));
    await expect(
      useAdminStore.getState().createUser({
        email: 'dup@test.local',
        displayName: 'Dup',
        role: 'admin',
      } as never),
    ).rejects.toThrow('Email taken');
    expect(useAdminStore.getState().mutationError).toBe('Email taken');
    expect(useAdminStore.getState().mutating).toBe(false);
  });

  it('deleteUser refreshes list', async () => {
    mockGraphql.mockResolvedValueOnce({}).mockResolvedValueOnce({ adminUsers: [] });
    await useAdminStore.getState().deleteUser('a1');
    expect(useAdminStore.getState().users.data).toEqual([]);
    expect(useAdminStore.getState().mutating).toBe(false);
  });

  it('deleteUser records mutation error', async () => {
    mockGraphql.mockRejectedValue(new Error('Cannot delete'));
    await expect(useAdminStore.getState().deleteUser('a1')).rejects.toThrow('Cannot delete');
    expect(useAdminStore.getState().mutationError).toBe('Cannot delete');
  });
});
