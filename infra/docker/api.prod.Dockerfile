# Production API image (NestJS + Prisma). Build context: repository root.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/backend/email-templates/package.json packages/backend/email-templates/
COPY packages/backend/data-access/data-access-prisma/package.json packages/backend/data-access/data-access-prisma/
COPY packages/shared/types/package.json packages/shared/types/

# Install all workspaces (monorepo); prune is optional for v1.
COPY . .
RUN npm ci

RUN npm run build:email-templates \
  && npm run prisma:generate \
  && npm run build -w @app/api

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S soenglish && adduser -S soenglish -G soenglish

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/backend/data-access/data-access-prisma ./packages/backend/data-access/data-access-prisma

USER soenglish
EXPOSE 3000

# Migrations: run `npm run prisma:migrate:deploy` as a release job / init container before start.
CMD ["node", "dist/apps/api/apps/api/src/main.js"]
