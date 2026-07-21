# CI/CD

GitHub Actions pipelines for the Arvilio monorepo.

## Pipelines

| Workflow | File | When | Purpose |
|----------|------|------|---------|
| **CI** | `.github/workflows/ci.yml` | Every PR + push to `main` | Lint, typecheck, unit + integration tests, production build |
| **E2E** | `.github/workflows/e2e.yml` | After **green CI** on `main` (`workflow_run`), weekly cron, manual | Playwright against `npm run dev` |
| **CD** | `.github/workflows/cd.yml` | After **green CI** on `main` (`workflow_run`), version tags `v*`, manual | Build & push API/Campus images to GHCR |

All workflows use **Node 22**, **PostgreSQL 16**, and the composite action `.github/actions/setup-monorepo` (`npm ci` + `prisma generate`).

### npm 11 (required)

Root `package.json` pins `"packageManager": "npm@11.6.2"`. The lockfile is **not** compatible with npm 10 (`npm ci` fails with missing `@emnapi/*` / `chokidar@4`).

`setup-monorepo` and production Dockerfiles force npm 11:

1. `corepack enable` + `corepack prepare npm@11.6.2 --activate`
2. `npm install -g npm@11.6.2` (setup-node / base image otherwise keep npm 10 on PATH)
3. Assert `npm -v` matches `11.*` before `npm ci`

### CI jobs (parallel)

```
quality ──┐
unit      ├──► ci-success (gate)
integration
build ◄─── quality (needs)
```

- **quality** — `npm run lint`, `npm run typecheck` (`build:email-templates` runs first — path alias points at `dist/index.d.ts`)
- **unit** — `npm run test:unit`
- **integration** — Postgres service, `prisma migrate deploy`, `npm run test:integration`
- **build** — `build:api` + `build:campus` (validates release artifacts)

PRs must pass **ci-success** before merge (branch protection).

### E2E

Not on every PR (runtime cost). Runs when CI succeeds on `main`/`master`, **Mondays 04:00 UTC**, or **Actions → E2E → Run workflow**. Checks out `workflow_run.head_sha` so it tests the same commit as CI.

Requires: migrate + `npm run seed:test-users` (see `.env.test.example` for Playwright credentials).

### CD / images

CD does **not** run on every push in parallel with CI. It starts only after CI concludes **success** on `main` (or on `v*` tags / manual dispatch). That avoids publishing images from a red build.

Images:

- `ghcr.io/<owner>/<repo>/api:<tag>`
- `ghcr.io/<owner>/<repo>/campus:<tag>`

Tags: branch name (from CI head branch), git SHA as `sha-<fullsha>`, `latest` on default-branch runs, semver on `v*` tags.

Dockerfiles:

- `infra/docker/api.prod.Dockerfile` — compiled NestJS (`dist/apps/api/...`)
- `infra/docker/campus.prod.Dockerfile` — Next.js `output: 'standalone'`

Local dev (hot reload) still uses `infra/docker/api.Dockerfile` + `campus.Dockerfile` via `docker-compose.yml`.

### Deploy (your infrastructure)

CD publishes images only. **Deploy** is wired through GitHub **Environments**:

1. Create environments **staging** and **production** (Settings → Environments).
2. Add secrets (SSH host, keys, or cloud provider tokens).
3. Extend `deploy-staging` / `deploy-production` jobs in `cd.yml`, or use `infra/docker/docker-compose.prod.yml` on the server:

```bash
export GHCR_OWNER=your-org/Arvilio
export IMAGE_TAG=main
export POSTGRES_PASSWORD=...
export DATABASE_URL=postgresql://...
export JWT_SECRET=...
docker compose -f infra/docker/docker-compose.prod.yml pull
docker compose -f infra/docker/docker-compose.prod.yml run --rm migrate
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

**Lockfile / Docker builds:** if `npm ci` still misses optional platform deps after npm 11 is forced, sync on Linux:

```bash
npm run lockfile:linux
git add package-lock.json && git commit -m "chore: sync package-lock.json for Linux npm ci"
```

### Dependabot PRs failing at `setup-monorepo`

If CI dies in ~30s on **Install dependencies** (`npm ci`), not on lint/tests:

| Symptom | Cause | What to do |
|---------|--------|------------|
| `Missing: @emnapi/core@…` / `@emnapi/runtime@…` with **npm 10** in the log | Runner used npm 10 | Ensure `setup-monorepo` npm 11 assert is on the branch |
| Same missing packages with **npm 11** | Lockfile generated off Linux | `npm run lockfile:linux`, merge, rebase Dependabot PRs |
| `ERESOLVE` / `eslint@10` vs `eslint-plugin-import` | Old grouped dev PR bumped incompatible majors | **Close** PR **dev-dependencies**; `.github/dependabot.yml` no longer groups dev deps |

**Release checklist**

1. PR green on **CI**
2. Merge to `main` → CI green → **CD** pushes images; **E2E** starts
3. Run migrations (`prisma migrate deploy`) before or via `migrate` service
4. Roll out API, then Campus (or together via compose)
5. Optional: tag `v1.2.3` → production environment deploy job

## Branch protection (recommended)

On `main` (Settings → Branches → Branch protection rules):

- Require status check **CI gate** (job name `CI gate` / `ci-success`)
- Require PR reviews
- Do **not** require E2E on every PR (post-merge / schedule only)

## Local parity

```bash
npm ci   # must be npm 11.x — see packageManager
npm run prisma:generate
npm run prisma:migrate:deploy   # needs Postgres
npm run lint && npm run typecheck
npm run test:unit
RUN_INTEGRATION_TESTS=1 npm run test:integration
npm run build:api && npm run build:campus
```

## Future improvements

- Turborepo remote cache in CI
- Path filters (run web jobs only when `apps/campus/**` changes)
- PR-required E2E with `workflow_run` + label `run-e2e`
- Kubernetes manifests / Helm chart under `infra/k8s/`
