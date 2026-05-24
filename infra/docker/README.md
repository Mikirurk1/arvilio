# SoEnglish — Docker (local dev)

## Services (`docker-compose.yml`)

| Container | Image / build | Host port |
|-----------|---------------|-----------|
| `soenglish-postgres` | `postgres:16-alpine` | 5432 |
| `soenglish-api` | `infra/docker/api.Dockerfile` | 3000 |
| `soenglish-web` | `infra/docker/web.Dockerfile` | 4200 |

Volume: `soenglish_soenglish-postgres-data` (PostgreSQL data).

Production stack (GHCR images): `docker-compose.prod.yml` — not used for everyday local dev.

## Restore after `docker rm` / prune

1. Start **Docker Desktop** (wait until fully running).
2. From repo root — full restore + scan for other compose files on disk:

```bash
npm run docker:restore
```

Or only SoEnglish:

```bash
npm run docker:up
```

Requires `.env` at repo root (copy from `.env.example` if missing).

API image compiles at **build** time (`docker compose build api`). For hot reload use postgres in Docker + `npm run dev` on the host.

If `docker info` fails while Docker Desktop is open: the **engine** is not up — run `open -a Docker` and wait ~30s, or **Restart** from the whale menu. `npm run docker:restore` does this automatically.

3. Apply DB schema (fresh volume):

```bash
npm run prisma:migrate:deploy
npm run seed:test-users   # optional test accounts
```

4. Check:

```bash
npm run docker:ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api
open http://localhost:4200
```

## Alternative: DB in Docker, app on host

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
npm run dev
```

## Stop

```bash
npm run docker:down          # keep DB volume
npm run docker:down -- -v    # delete volume (all DB data)
```
