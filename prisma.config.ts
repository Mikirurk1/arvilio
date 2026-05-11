import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'packages/backend/data-access/data-access-prisma/prisma/schema.prisma',
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public',
  },
});
