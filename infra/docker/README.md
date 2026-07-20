# Arvilio — Docker (local)

## Рекомендований локальний dev (без api/web у Docker)

Логи API і web у **терміналі**, hot reload:

```bash
npm run docker:up      # Postgres (+ LiveKit / LibreTranslate з compose)
npm run dev            # API :3000 + Campus :4200 на хості
```

Якщо раніше піднімали повний стек у Docker — зупиніть api/web:

```bash
npm run docker:stack:down
```

## Що в `docker-compose.yml`

| Сервіс | Container | За замовчуванням | Профіль `stack` |
|--------|-----------|------------------|-----------------|
| `postgres` | `arvilio-postgres` | ✅ `docker:up` | ✅ |
| `livekit` | `arvilio-livekit` | ✅ | ✅ |
| `libretranslate` | `arvilio-libretranslate` | ✅ | ✅ |
| `api` | `arvilio-api` | ❌ | `npm run docker:stack` |
| `campus` | `arvilio-campus` | ❌ | `npm run docker:stack` |

Volume: `arvilio-postgres-data`.

Postgres **credentials** для local лишаються `soenglish` / `soenglish` (user/db/password) — щоб існуючий `DATABASE_URL` і дампи не ламались. Імена контейнерів/volume — лише `arvilio-*`.

Production: `docker-compose.prod.yml` (GHCR) — не для щоденного dev.

## Команди

| npm script | Дія |
|------------|-----|
| `docker:up` | Postgres + LiveKit + LibreTranslate |
| `docker:postgres` | Те саме, що `docker:up` |
| `docker:stack` | Postgres + api + campus у контейнерах (логи: `docker:logs`) |
| `docker:stack:down` | Зупинити лише `arvilio-api` і `arvilio-campus` |
| `docker:down` | Зупинити всі сервіси compose (включно з Postgres) |
| `docker:ps` / `docker:logs` | Статус / логи |

## Postgres

```bash
pg_isready -h localhost -p 5432 -U soenglish -d soenglish
npm run prisma:migrate:deploy   # після нового volume
```

## Повний restore (опційно, з api/web у Docker)

```bash
npm run docker:restore:stack
```

Або лише БД + dev на хості:

```bash
npm run docker:restore
npm run dev
```

## Docker Desktop

Якщо `Cannot connect to the Docker daemon` — увімкніть Docker Desktop; скрипти `docker:up` / `docker:postgres` чекають engine (`scripts/docker-wait-engine.sh`).
