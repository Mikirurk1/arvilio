# Скріншоти та діаграми для курсової SoEnglish

У Word замініть маркер **[ВСТАВИТИ РИС. N]** відповідним зображенням.

## Діаграми (вже згенеровані з Mermaid)

```bash
node docs/coursework/diagrams/render-diagrams.mjs
```

Джерела: `docs/coursework/diagrams/*.mmd`. Після змін у `.mmd` перезапустіть команду.

| Рис. | Файл | Статус |
|------|------|--------|
| 1 | `01-architecture.png` | ✅ з `diagrams/01-architecture.mmd` |
| 2 | `02-layers.png` | ✅ з `diagrams/02-layers.mmd` |
| 3 | `03-use-case.png` | ✅ з `diagrams/03-use-case.mmd` |
| 4 | `04-monorepo-tree.png` | ✅ з `diagrams/04-monorepo-tree.mmd` |
| 5 | `05-erd.png` | ✅ з `diagrams/05-erd-core.mmd` |
| 20 | `20-erd-full.png` | ✅ з `diagrams/20-erd-full.mmd` |

## Скріншоти (зняти вручну з застосунку)

| Рис. | Файл (рекоменд.) | Що зняти |
|------|------------------|----------|
| 6 | `06-schema-prisma.png` | Код `schema.prisma` (User, ScheduledLesson, Word) |
| 7 | `07-graphql-dashboard.png` | GraphQL Playground, query `dashboardSummary` |
| 8 | `08-api-dev-log.png` | Термінал: `Application is running on: http://localhost:3000/api` |
| 9 | `09-login.png` | `/login` |
| 10 | `10-dashboard.png` | `/dashboard` (student, live data) |
| 11 | `11-calendar.png` | `/calendar` + модалка уроку |
| 12 | `12-vocabulary.png` | `/vocabulary` |
| 13 | `13-practice.png` | `/practice` або `/practice/quiz` |
| 14 | `14-chat.png` | `/chat` з повідомленнями / вкладенням |
| 15 | `15-profile-students.png` | `/profile` або `/students` (teacher) |
| 16 | `16-network-ws.png` | DevTools → Network: graphql + socket.io |
| 17 | `17-postman-login.png` | Postman: POST login / me |
| 18 | `18-chat-sent.png` | Успішно надіслане повідомлення в чаті |
| 19 | `19-toast-error.png` | Toast помилки (опційно) |
| 21 | `21-sidebar-roles.png` | Два скріни sidebar: student vs teacher |

## LAN / чат

Якщо тестуєте з іншого ПК у мережі, у `.env` вкажіть `WEB_ORIGIN` і `NEXT_PUBLIC_SOCKET_URL` на IP хоста (див. wiki `concepts/chat.md`).

## Якість

- Ширина ≥ 1280 px
- Формат PNG або JPG
- Без зайвих персональних даних у скріншотах (замініть на тестові акаунти)
