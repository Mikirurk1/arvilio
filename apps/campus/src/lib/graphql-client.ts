import { API_BASE } from './api';

export class GraphqlError extends Error {
  constructor(
    message: string,
    public readonly errors?: Array<{ message: string }>,
  ) {
    super(message);
    this.name = 'GraphqlError';
  }
}

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

let inFlightSessionRefresh: Promise<boolean> | null = null;

function isUnauthorizedMessage(message: string): boolean {
  return /\bunauthorized\b|\bforbidden\b/i.test(message);
}

async function refreshSessionOnce(): Promise<boolean> {
  if (inFlightSessionRefresh) return inFlightSessionRefresh;
  inFlightSessionRefresh = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      inFlightSessionRefresh = null;
    }
  })();
  return inFlightSessionRefresh;
}

export async function graphqlRequest<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  return graphqlRequestInternal(query, variables, true);
}

async function graphqlRequestInternal<
  TData,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  query: string,
  variables?: TVariables,
  allowRetry = true,
): Promise<TData> {
  const response = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    if (allowRetry && (response.status === 401 || response.status === 403)) {
      const refreshed = await refreshSessionOnce();
      if (refreshed) {
        return graphqlRequestInternal(query, variables, false);
      }
    }
    let message = `GraphQL request failed: ${response.status}`;
    try {
      const text = await response.text();
      if (text) {
        // Extract a human message — raw JSON bodies end up in user-facing error states.
        try {
          const body = JSON.parse(text) as { errors?: Array<{ message?: string }>; message?: string };
          message = body.errors?.[0]?.message ?? body.message ?? message;
        } catch {
          message = text;
        }
      }
    } catch {
      // ignore
    }
    throw new GraphqlError(message);
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  if (payload.errors?.length) {
    if (allowRetry && payload.errors.some((entry) => isUnauthorizedMessage(entry.message))) {
      const refreshed = await refreshSessionOnce();
      if (refreshed) {
        return graphqlRequestInternal(query, variables, false);
      }
    }
    throw new GraphqlError(payload.errors.map((e) => e.message).join('; '), payload.errors);
  }
  if (payload.data === undefined) {
    throw new GraphqlError('GraphQL response missing data');
  }
  return payload.data;
}
