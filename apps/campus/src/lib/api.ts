/**
 * Browser: same-origin `/api` (Next rewrite) so httpOnly auth cookies persist.
 * Server/SSR: direct API URL (Docker internal host or localhost).
 */
function resolveApiBase(): string {
  if (typeof window !== 'undefined') {
    const publicUrl = process.env.NEXT_PUBLIC_API_URL;
    // Same-origin path only in the browser — http://localhost:3000 breaks cookie persistence.
    if (publicUrl && !publicUrl.startsWith('http')) {
      return publicUrl.replace(/\/$/, '');
    }
    return '/api';
  }
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000/api'
  ).replace(/\/$/, '');
}

const API_BASE_URL = resolveApiBase();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly featureBlocked?: string,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    cache: options.cache ?? 'no-store',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `API request failed for ${path}: ${response.status}`;
    let featureBlocked: string | undefined;
    try {
      const text = await response.text();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string | string[]; featureBlocked?: string };
          if (parsed?.message) {
            message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
          }
          if (parsed?.featureBlocked) {
            featureBlocked = parsed.featureBlocked;
          }
        } catch {
          message = text;
        }
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message, featureBlocked);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

export async function getApiData<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiClient.get<T>(path);
  } catch {
    return fallback;
  }
}

export const API_BASE = API_BASE_URL;

/** Same-origin API path for href/src/fetch in UI (consistent on SSR + client). */
export function browserApiPath(path: string): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
}

/** OAuth must use same-origin path in the browser (Next `/api` rewrite). */
export const GOOGLE_SIGN_IN_URL = '/api/auth/google';
/** Link Google + Calendar to the current session (Profile → Connections). */
export const GOOGLE_LINK_URL = '/api/auth/google/link';
export const FACEBOOK_LINK_URL = '/api/auth/facebook/link';
/** Link Zoom OAuth to the current session for video meetings. */
export const ZOOM_LINK_URL = '/api/auth/zoom/link';
