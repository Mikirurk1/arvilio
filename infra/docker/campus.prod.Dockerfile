# Production Campus image (Next.js standalone). Build context: repository root.
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

RUN npm run build -w @app/campus

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4200
ENV HOSTNAME=0.0.0.0

RUN addgroup -S arvilio && adduser -S arvilio -G arvilio

COPY --from=builder /app/apps/campus/public ./apps/campus/public
COPY --from=builder /app/apps/campus/.next/standalone ./
COPY --from=builder /app/apps/campus/.next/static ./apps/campus/.next/static

USER arvilio
EXPOSE 4200

CMD ["node", "apps/campus/server.js"]
