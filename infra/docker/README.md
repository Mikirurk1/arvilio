# SoEnglish — Docker (local)

## Рекомендований локальний dev (без api/web у Docker)

Логи API і web у **терміналі**, hot reload:

```bash
npm run docker:up      # лише Postgres (порт 5432)
npm run dev            # API :3000 + Next :4200 на хості
```

Якщо раніше піднімали повний стек у Docker — зупиніть api/web:

```bash
npm run docker:stack:down
```

## Що в `docker-compose.yml`

| Сервіс | За замовчуванням | Профіль `stack` |
|--------|------------------|-----------------|
| `soenglish-postgres` | ✅ `docker:up` | ✅ |
| `soenglish-api` | ❌ | `npm run docker:stack` |
| `soenglish-web` | ❌ | `npm run docker:stack` |

Volume: `soenglish-postgres-data`.

Production: `docker-compose.prod.yml` (GHCR) — не для щоденного dev.

## Команди

| npm script | Дія |
|------------|-----|
| `docker:up` | Postgres only |
| `docker:postgres` | Те саме, що `docker:up` |
| `docker:stack` | Postgres + api + web у контейнерах (логи: `docker:logs`) |
| `docker:stack:down` | Зупинити лише `soenglish-api` і `soenglish-web` |
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
