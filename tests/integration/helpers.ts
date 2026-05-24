import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TEST_PASSWORD, TEST_USERS, type TestUserKey } from './seed';

/** Supertest agent logged in as a seeded test user. */
export async function loginAs(app: INestApplication, role: TestUserKey) {
  const agent = request.agent(app.getHttpServer());
  const email = TEST_USERS[role].email;
  await agent.post('/api/auth/login').send({ email, password: TEST_PASSWORD }).expect(201);
  return agent;
}

export function graphqlUrl(): string {
  return '/api/graphql';
}

/** GraphQL POST as a seeded test user. */
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
