import { mockAuthUser } from '../testing/fixtures';
import { useAuthStore } from './auth-store';

const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('../lib/api', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  ApiError: class ApiError extends Error {
    constructor(
      public status: number,
      message?: string,
    ) {
      super(message ?? `HTTP ${status}`);
    }
  },
  GOOGLE_SIGN_IN_URL: '/api/auth/google',
}));

const sampleUser = mockAuthUser({
  id: 'u1',
  email: 'student@test.local',
  displayName: 'Student',
});

describe('auth-store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      loading: false,
      error: null,
      googleSignInUrl: '/api/auth/google',
    });
  });

  it('login stores user from session', async () => {
    mockPost.mockResolvedValueOnce({ user: sampleUser });
    await useAuthStore.getState().login({ email: 'student@test.local', password: 'x' });
    expect(useAuthStore.getState().user?.email).toBe('student@test.local');
    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'student@test.local',
      password: 'x',
    });
  });

  it('refresh loads user from /auth/me', async () => {
    mockGet.mockResolvedValueOnce({ user: sampleUser });
    await useAuthStore.getState().refresh();
    expect(useAuthStore.getState().user?.id).toBe('u1');
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('refresh tries /auth/refresh on 401', async () => {
    const { ApiError } = jest.requireMock('../lib/api') as {
      ApiError: new (status: number) => Error;
    };
    mockGet.mockRejectedValueOnce(new ApiError(401));
    mockPost.mockResolvedValueOnce({ user: sampleUser });
    await useAuthStore.getState().refresh();
    expect(mockPost).toHaveBeenCalledWith('/auth/refresh');
    expect(useAuthStore.getState().user?.email).toBe('student@test.local');
  });

  it('logout clears user', async () => {
    useAuthStore.setState({ user: sampleUser });
    mockPost.mockResolvedValueOnce({ ok: true });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('logout clears user even when API fails', async () => {
    useAuthStore.setState({ user: sampleUser });
    mockPost.mockRejectedValueOnce(new Error('network'));
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('refresh rotates session on 403', async () => {
    const { ApiError } = jest.requireMock('../lib/api') as {
      ApiError: new (status: number) => Error;
    };
    mockGet.mockRejectedValueOnce(new ApiError(403));
    mockPost.mockResolvedValueOnce({ user: sampleUser });
    await useAuthStore.getState().refresh();
    expect(useAuthStore.getState().user?.id).toBe('u1');
  });

  it('refresh clears user when refresh fails after 401', async () => {
    const { ApiError } = jest.requireMock('../lib/api') as {
      ApiError: new (status: number) => Error;
    };
    mockGet.mockRejectedValueOnce(new ApiError(401));
    mockPost.mockRejectedValueOnce(new Error('refresh failed'));
    await useAuthStore.getState().refresh();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('refresh stores error message for non-auth failures', async () => {
    mockGet.mockRejectedValueOnce(new Error('Server down'));
    await useAuthStore.getState().refresh();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().error).toBe('Server down');
  });

  it('login sets error and rethrows on failure', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));
    await expect(
      useAuthStore.getState().login({ email: 'x@test.local', password: 'bad' }),
    ).rejects.toThrow('Invalid credentials');
    expect(useAuthStore.getState().error).toBe('Invalid credentials');
  });
});
