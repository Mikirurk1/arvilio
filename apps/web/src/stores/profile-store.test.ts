import { DEFAULT_NOTIFICATION_PREFS } from '@pkg/types';
import { mockAuthUser, mockMyProfile } from '../testing/fixtures';
import { createIdleSlice, sliceSuccess } from './lib/async-slice';
import { useAuthStore } from './auth-store';
import { useProfileStore } from './profile-store';

const mockGraphql = jest.fn();

jest.mock('../lib/graphql-client', () => ({
  graphqlRequest: (...args: unknown[]) => mockGraphql(...args),
}));

const profile = mockMyProfile({
  id: 'u1',
  email: 'a@test.local',
  displayName: 'Alice',
  timezone: 'UTC',
});

describe('profile-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({
      profile: createIdleSlice(),
      passwordMutating: false,
      passwordError: null,
      profileMutating: false,
      profileError: null,
    });
    useAuthStore.setState({
      user: mockAuthUser({
        id: 'u1',
        email: 'a@test.local',
        displayName: 'Alice',
        timezone: 'UTC',
        proficiencyLevel: 'B1',
      }),
      loading: false,
      error: null,
      googleSignInUrl: '/api/auth/google',
    });
  });

  it('fetchProfile loads myProfile', async () => {
    mockGraphql.mockResolvedValue({ myProfile: profile });
    await useProfileStore.getState().fetchProfile(true);
    expect(useProfileStore.getState().profile.status).toBe('success');
    expect(useProfileStore.getState().profile.data).toEqual(profile);
  });

  it('fetchProfile skips warm cache', async () => {
    useProfileStore.setState({ profile: sliceSuccess(createIdleSlice(), profile) });
    await useProfileStore.getState().fetchProfile(false);
    expect(mockGraphql).not.toHaveBeenCalled();
  });

  it('fetchProfile records errors', async () => {
    mockGraphql.mockRejectedValue(new Error('Network'));
    await useProfileStore.getState().fetchProfile(true);
    expect(useProfileStore.getState().profile.status).toBe('error');
  });

  it('updateProfile updates cache and auth user', async () => {
    useProfileStore.setState({ profile: sliceSuccess(createIdleSlice(), profile) });
    mockGraphql.mockResolvedValue({
      updateMyProfile: { ...profile, displayName: 'Alicia', email: '' },
    });
    const updated = await useProfileStore.getState().updateProfile({ displayName: 'Alicia' });
    expect(updated.displayName).toBe('Alicia');
    expect(updated.email).toBe('a@test.local');
    expect(useAuthStore.getState().user?.displayName).toBe('Alicia');
    expect(useProfileStore.getState().profileMutating).toBe(false);
  });

  it('updateProfile records error', async () => {
    mockGraphql.mockRejectedValue(new Error('Validation failed'));
    await expect(
      useProfileStore.getState().updateProfile({ displayName: 'X' }),
    ).rejects.toThrow('Validation failed');
    expect(useProfileStore.getState().profileError).toBe('Validation failed');
    expect(useProfileStore.getState().profileMutating).toBe(false);
  });

  it('updateNotificationPrefs delegates to updateProfile', async () => {
    useProfileStore.setState({ profile: sliceSuccess(createIdleSlice(), profile) });
    const prefs = { ...DEFAULT_NOTIFICATION_PREFS, newVocab: true, weeklyReport: false };
    mockGraphql.mockResolvedValue({
      updateMyProfile: {
        ...profile,
        notificationPrefs: prefs,
      },
    });
    const updated = await useProfileStore.getState().updateNotificationPrefs(prefs);
    expect(updated.notificationPrefs).toEqual(prefs);
  });

  it('changePassword clears mutating flag on success', async () => {
    mockGraphql.mockResolvedValue({});
    await useProfileStore.getState().changePassword({
      currentPassword: 'old',
      newPassword: 'new123456',
    });
    expect(useProfileStore.getState().passwordMutating).toBe(false);
    expect(useProfileStore.getState().passwordError).toBeNull();
  });

  it('changePassword records error', async () => {
    mockGraphql.mockRejectedValue(new Error('Wrong password'));
    await expect(
      useProfileStore.getState().changePassword({
        currentPassword: 'bad',
        newPassword: 'new123456',
      }),
    ).rejects.toThrow('Wrong password');
    expect(useProfileStore.getState().passwordError).toBe('Wrong password');
    expect(useProfileStore.getState().passwordMutating).toBe(false);
  });
});
