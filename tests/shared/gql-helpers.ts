import type { INestApplication } from '@nestjs/common';
import type request from 'supertest';
import { graphqlUrl } from '../integration/helpers';
import type { TestUserKey } from '../integration/seed';
import { loginAs } from '../integration/helpers';

export { graphqlUrl, loginAs };
export type { TestUserKey };

/** Run GraphQL as a seeded role; returns supertest response. */
export async function gqlAs(
  app: INestApplication,
  role: TestUserKey,
  query: string,
  variables?: Record<string, unknown>,
) {
  const agent = await loginAs(app, role);
  return agent
    .post(graphqlUrl())
    .send({ query, variables })
    .set('Content-Type', 'application/json');
}
