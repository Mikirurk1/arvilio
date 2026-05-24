# CI/CD

GitHub Actions pipelines for the SoEnglish monorepo.

## Pipelines

| Workflow | File | When | Purpose |
|----------|------|------|---------|
| **CI** | `.github/workflows/ci.yml` | Every PR + push to `main` | Lint, typecheck, unit + integration tests, production build |
| **E2E** | `.github/workflows/e2e.yml` | `main` push, weekly cron, manual | Playwright against `npm run dev` |
| **CD** | `.github/workflows/cd.yml` | `main` push, version tags `v*`, manual | Build & push API/Web images to GHCR |

All workflows use **Node 22**, **PostgreSQL 16**, and the composite action `.github/actions/setup-monorepo` (`npm ci` + `prisma generate`).

### CI jobs (parallel)

```
quality ──┐
unit      ├──► ci-success (gate)
integration
build ◄─── quality (needs)
```

- **quality** — `npm run lint`, `npm run typecheck`
- **unit** — `npm run test:unit`
- **integration** — Postgres service, `prisma migrate deploy`, `npm run test:integration`
- **build** — `build:api` + `build:web` (validates release artifacts)

PRs must pass **ci-success** before merge (branch protection).

### E2E

Not on every PR (runtime cost). Runs on merges to `main`, **Mondays 04:00 UTC**, or **Actions → E2E → Run workflow**.

Requires: migrate + `npm run seed:test-users` (see `.env.test.example` for Playwright credentials).

### CD / images

Images:

- `ghcr.io/<owner>/<repo>/api:<tag>`
- `ghcr.io/<owner>/<repo>/web:<tag>`

Tags: branch name, git SHA, `latest` on `main`, semver on `v*` tags.

Dockerfiles:

- `infra/docker/api.prod.Dockerfile` — compiled NestJS (`dist/apps/api/...`)
- `infra/docker/web.prod.Dockerfile` — Next.js `output: 'standalone'`

Local dev (hot reload) still uses `infra/docker/api.Dockerfile` + `web.Dockerfile` via `docker-compose.yml`.

### Deploy (your infrastructure)

CD publishes images only. **Deploy** is wired through GitHub **Environments**:

1. Create environments **staging** and **production** (Settings → Environments).
2. Add secrets (SSH host, keys, or cloud provider tokens).
3. Extend `deploy-staging` / `deploy-production` jobs in `cd.yml`, or use `infra/docker/docker-compose.prod.yml` on the server:

```bash
export GHCR_OWNER=your-org/SoEnglish
export IMAGE_TAG=main
export POSTGRES_PASSWORD=...
export DATABASE_URL=postgresql://...
export JWT_SECRET=...
docker compose -f infra/docker/docker-compose.prod.yml pull
docker compose -f infra/docker/docker-compose.prod.yml run --rm migrate
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

**Lockfile / Docker builds:** commit `package-lock.json` from a Linux `npm install` when CD fails with missing optional deps (e.g. `@emnapi/*`). Dockerfiles use `corepack prepare npm@11.6.2` to match root `packageManager`.

**Release checklist**

1. PR green on **CI**
2. Merge to `main` → **CD** pushes images
3. Run migrations (`prisma migrate deploy`) before or via `migrate` service
4. Roll out API, then Web (or together via compose)
5. Optional: tag `v1.2.3` → production environment deploy job

## Branch protection (recommended)

On `main`:

- Require status check **CI gate** (job `ci-success`)
- Require PR reviews
- Optional: require **E2E** for release branches only

## Local parity

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy   # needs Postgres
npm run lint && npm run typecheck
npm run test:unit
RUN_INTEGRATION_TESTS=1 npm run test:integration
npm run build:api && npm run build:web
```

## Future improvements

- Turborepo remote cache in CI
- Path filters (run web jobs only when `apps/web/**` changes)
- PR-required E2E with `workflow_run` + label `run-e2e`
- Kubernetes manifests / Helm chart under `infra/k8s/`
