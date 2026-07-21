# Production API image (NestJS + Prisma). Build context: repository root.
FROM node:22-alpine AS builder

# Match root packageManager (npm@11.6.2). Base image npm 10 fails `npm ci` on this lockfile.
RUN corepack enable \
  && corepack prepare npm@11.6.2 --activate \
  && npm install -g npm@11.6.2 \
  && npm -v | grep -E '^11\.'

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

RUN npm ci

RUN npm run build:email-templates \
  && npm run prisma:generate \
  && npm run build -w @app/api

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S arvilio && adduser -S arvilio -G arvilio

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/backend/data-access/data-access-prisma ./packages/backend/data-access/data-access-prisma

USER arvilio
EXPOSE 3000

# Migrations: run `npm run prisma:migrate:deploy` as a release job / init container before start.
CMD ["node", "dist/apps/api/apps/api/src/main.js"]
