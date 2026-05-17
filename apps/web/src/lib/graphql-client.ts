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

export async function graphqlRequest<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
): Promise<TData> {
  const response = await fetch(`${API_BASE}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    let message = `GraphQL request failed: ${response.status}`;
    try {
      const text = await response.text();
      if (text) message = text;
    } catch {
      // ignore
    }
    throw new GraphqlError(message);
  }

  const payload = (await response.json()) as GraphqlResponse<TData>;
  if (payload.errors?.length) {
    throw new GraphqlError(payload.errors.map((e) => e.message).join('; '), payload.errors);
  }
  if (payload.data === undefined) {
    throw new GraphqlError('GraphQL response missing data');
  }
  return payload.data;
}
