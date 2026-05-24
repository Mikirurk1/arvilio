# Production Web image (Next.js standalone). Build context: repository root.
FROM node:22-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV API_PROXY_TARGET=http://api:3000

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/shared/types/package.json packages/shared/types/

COPY . .
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
