# Arvilio LLM Wiki

Персистентна база знань проєкту за патерном [LLM Wiki](https://github.com/karpathy/llm-wiki) (Karpathy): джерела → wiki → схема.

## Три шари

| Шар | Шлях | Хто пише |
|-----|------|----------|
| Raw sources | `raw/` | Ви (immutable) |
| Wiki | `wiki/` | LLM-агент |
| Schema | `AGENTS.md` | Ви + агент (workflow) |

## Поведінка агента (Cursor)

Правило `llm-wiki-triggers.mdc` (**завжди увімкнене**):

- Після змістовних змін у коді або розслідування — **доповнює wiki** (легкий `update`, не повний ingest).
- Перед відповіддю про домен/архітектуру — читає `wiki/index.md`.
- В кінці задачі — коротко пише, які сторінки wiki оновлено.

Сказати **skip wiki** — щоб пропустити оновлення в цій сесії.

### Явні команди

- **Ingest:** «ingest `raw/meeting-2026-05-16.md`» — обробити джерело і оновити wiki
- **Query:** «wiki query: як працює join lesson meet?» — відповідь з цитатами з wiki
- **Lint:** «wiki lint» — перевірка суперечностей, orphan-сторінок, застарілих тверджень

Повна схема: [AGENTS.md](./AGENTS.md).

## Стан wiki (2026-05-16)

Після **full project bootstrap** у `wiki/` є ~29 сторінок: продукт, стек, ролі (4 рівні), сутності Prisma, доменні концепти, UI. Почніть з [wiki/index.md](wiki/index.md) або [wiki/overview.md](wiki/overview.md) в Obsidian.

## Obsidian

Відкрийте папку `docs/llm-wiki/wiki/` як vault (або весь `docs/llm-wiki/`). Граф і посилання `[[page]]` працюють між сторінками wiki.

## Materials (прототипи)

`materials/` не змінюється агентом без вашого запиту. Індекс: [docs/reference/materials-index.md](../reference/materials-index.md).

## Код vs wiki

- **Код** (`apps/`, `packages/`) — source of truth для поведінки.
- **Wiki** — скомпільоване розуміння домену, рішень, інтеграцій.
- При суперечності: код перемагає; wiki оновлюється після lint/ingest.
