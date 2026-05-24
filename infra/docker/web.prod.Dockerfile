# Production Web image (Next.js standalone). Build context: repository root.
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare npm@11.6.2 --activate

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_PROXY_TARGET=http://api:3000

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

RUN npm ci

RUN npm run build -w @app/web

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4200
ENV HOSTNAME=0.0.0.0

RUN addgroup -S soenglish && adduser -S soenglish -G soenglish

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

USER soenglish
EXPOSE 4200

CMD ["node", "apps/web/server.js"]
