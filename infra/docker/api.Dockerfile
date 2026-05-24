# Dev API image: build at image time (avoids OOM from tsc watch inside Docker).
# Hot reload: postgres in compose + `npm run dev` on the host.
FROM node:22-alpine

RUN corepack enable && corepack prepare npm@11.6.2 --activate

WORKDIR /workspace

ENV NODE_OPTIONS=--max-old-space-size=4096

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps apps
COPY packages packages

RUN npm install \
  && npm run build:email-templates \
  && npm run prisma:generate \
  && npm run build -w @app/api

EXPOSE 3000

CMD ["node", "dist/apps/api/apps/api/src/main.js"]
