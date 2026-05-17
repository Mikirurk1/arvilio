# Курсова робота: Розробка веб-платформи дистанційного навчання англійської мови SoEnglish

Міністерство освіти і науки України  
**Національний університет «Львівська політехніка»**  
Інститут комп'ютерних наук та інформаційних технологій  
Кафедра САПР

**Дисципліна:** Проектування та розробка інформаційних систем  
**Виконав(ла):** [Прізвище Ім'я По батькові], гр. [Група]  
**Керівник:** викл. [Прізвище І. Б.]  
**Львів, 2026**

---

## ЗМІСТ

*У Word — автоматичний зміст з номерами сторінок; оновіть поле після відкриття DOCX.*

1. Анотація  
2. Вступ  
3. Шляхи покращення та план розвитку проєкту  
4. Розширення функціоналу  
5. Перспективи використання  
6. Розділ 1. Постановка завдання  
7. Розділ 2. Вимоги та інструменти  
8. Розділ 3. Реалізація (включно з 3.6 хуки, 3.7 функціонал)  
9. Розділ 4. Тестування  
10. Список джерел  
11. Додатки  

---

## АНОТАЦІЯ

Курсова робота присвячена проектуванню та практичній реалізації веб-платформи **SoEnglish** для дистанційного навчання англійської мови. Система охоплює індивідуальні уроки 1:1 з інтеграцією Google Meet, персональний словник із spaced repetition, генерацію та проходження квізів, календар занять, dashboard зі streak і daily goals, а також realtime-чат між учасниками навчального процесу.

Рівень зберігання даних реалізовано на **PostgreSQL** із ORM **Prisma**. Серверна частина побудована на **NestJS** (REST + GraphQL + Socket.IO), клієнтська — на **Next.js 16** та **React 19**.

---

## ВСТУП

Володіння англійською мовою є критичним фактором професійного та академічного успіху. Метою проєкту SoEnglish є створення єдиного веб-застосунку, який об’єднує розклад уроків, словникову роботу, практику, оцінювання через квізи та комунікацію в чаті.


> **[ВСТАВИТИ РИС. 1]** Загальна архітектура SoEnglish (Browser → Next.js → NestJS → PostgreSQL).. *Діаграма з docs/llm-wiki/wiki/synthesis/architecture.md або draw.io.*

*Рис. 1. Загальна архітектура SoEnglish (Browser → Next.js → NestJS → PostgreSQL).*


---

## ШЛЯХИ ПОКРАЩЕННЯ ТА ПЛАН РОЗВИТКУ ПРОЄКТУ

| Етап | Напрям | Зміст робіт |
| --- | --- | --- |
| 1 | Автоматизоване тестування | Налаштувати CI (GitHub Actions): lint, typecheck, e2e (Playwright/Cypress) на кожен PR. |
| 2 | Юніт-тести | Покрити Jest/Vitest сервіси module-auth, vocabulary, lessons, chat; мок Prisma для ізольованих тестів. |
| 3 | Доробка функціоналу | Закрити прогалини RBAC на API, server-side guards на web, повний Facebook OAuth, покращення LAN для Socket.IO. |
| 4 | Збір даних користувачів | Аналітика подій (уроки, слова, квізи), опитування в продукті, розширення звітності для викладачів і адмінів. |
| 5 | Оплата та фінанси | Інтеграція Stripe: пакети уроків, ліміти, історія платежів, контроль обороту та заборгованостей. |


### Шляхи технічного покращення

- Впровадження піраміди тестування: unit → integration → e2e; мінімальний coverage gate у CI.
- Рефакторинг критичних модулів з винесенням спільної логіки в packages/backend/core.
- Документація API (GraphQL schema export, OpenAPI для REST auth/chat).
- Спостережуваність: structured logging, health checks, Sentry для production.
- Оптимізація запитів Prisma (select/include, індекси під звіти dashboard).

## РОЗШИРЕННЯ ФУНКЦІОНАЛУ

| Напрям | Опис |
| --- | --- |
| Билінг | Stripe Checkout / Customer Portal; прив’язка оплати до кількості запланованих уроків. |
| Звітність | Розширені dashboard для teacher/admin: виручка, відвідуваність, прогрес словника. |
| Мобільний UX | PWA або React Native за спільними GraphQL операціями. |
| Контент | Імпорт готових курсів у каталог Lesson/Exercise; AI-генерація квізів. |
| Інтеграції | Zoom альтернатива, LMS export, webhooks для CRM школ. |


## ПЕРСПЕКТИВИ ВИКОРИСТАННЯ

- Мовні школи та репетиторські центри — централізований облік 1:1 уроків, оплат і словника студентів.
- Університети — додаткові курси англійської з прозорим розкладом і Meet.
- Корпоративне навчання — B2B-акаунти, групові чати, звіти для HR.
- Freelance-викладачі — особистий кабінет без власної IT-інфраструктури.

---

## РОЗДІЛ 1. ПОСТАНОВКА ЗАВДАННЯ

### 1.1. Вхідні дані

Облікові записи користувачів, заплановані уроки, словник, квізи, чат, OAuth, сповіщення.

### 1.2. Очікуваний результат

Єдиний веб-кабінет для student / teacher / admin з централізованою БД.

### 1.3. Аналіз існуючих рішень

| Рішення | Переваги | Недоліки |
| --- | --- | --- |
| Duolingo | Гейміфікація | Немає 1:1 викладача |
| Google Classroom | Матеріали | Слабкий словник |
| SoEnglish | Уроки+слова+квізи+чат | Потрібне розгортання |


### 1.4. Архітектура

Monorepo: apps/web, apps/api, packages/backend/modules/*, Prisma.


> **[ВСТАВИТИ РИС. 2]** Шари monorepo: apps/web, apps/api, packages/backend/modules.. *Скрін дерева проєкту в IDE.*

*Рис. 2. Шари monorepo: apps/web, apps/api, packages/backend/modules.*


### 1.5. Обґрунтування технологій

PostgreSQL, TypeScript, NestJS, Next.js, Prisma, GraphQL.

---

## РОЗДІЛ 2. ВИМОГИ ТА ІНСТРУМЕНТИ


> **[ВСТАВИТИ РИС. 3]** Діаграма випадків використання (Student / Teacher / Admin).. *UML use-case у draw.io / Figma.*

*Рис. 3. Діаграма випадків використання (Student / Teacher / Admin).*


### 2.1.1. Функціональні вимоги — Студент

| ID | Функціональність | Опис |
| --- | --- | --- |
| FR-S01 | Авторизація | Вхід за email/паролем або Google OAuth; сесія в httpOnly cookies. |
| FR-S02 | Dashboard | Статистика уроків і словника; daily goals; learning streak; word of the day. |
| FR-S03 | Календар і уроки | Перегляд запланованих уроків 1:1; посилання Google Meet; матеріали та ДЗ. |
| FR-S04 | Словник | Особисті картки слів; статуси mastery; переклади; lookup через dictionary API. |
| FR-S05 | Practice | Вправи зі словником; квізи; облік practice sessions. |
| FR-S06 | Квізи | Проходження призначених quiz; фіксація спроб і відповідей. |
| FR-S07 | Чат | Direct і group conversations; Socket.IO; вкладення файлів (TTL 24 год). |
| FR-S08 | Профіль | Редагування профілю; мови навчання; Telegram; сповіщення. |


### Викладач

| ID | Функціональність | Опис |
| --- | --- | --- |
| FR-T01 | Розклад уроків | CRUD ScheduledLesson; recurrence; синхронізація Google Calendar. |
| FR-T02 | Студенти | Список закріплених студентів; перегляд прогресу. |
| FR-T03 | Квізи | Генерація та призначення quiz студентам. |
| FR-T04 | Повідомлення | TeacherMessage (email/Telegram) з профілю студента. |
| FR-T05 | Чат | Листування зі студентами згідно ChatVisibilityService. |


### Адміністратор

| ID | Функціональність | Опис |
| --- | --- | --- |
| FR-A01 | Користувачі | Створення/видалення студентів; admin users (GraphQL AdminResolver). |
| FR-A02 | Групові чати | createGroupConversation для адміністраторів. |
| FR-A03 | Системна пошта | SMTP status; test welcome email (super-admin). |
| FR-A04 | Словникові провайдери | Налаштування dictionary provider у PlatformSettings. |


### 2.1.2. Нефункціональні

| ID | Вимога | Опис |
| --- | --- | --- |
| NFR-01 | Безпека | JWT access/refresh у httpOnly cookies; bcrypt для паролів; GqlAuthGuard. |
| NFR-02 | Розділення ролей | STUDENT, TEACHER, ADMIN, SUPER_ADMIN; client role matrix. |
| NFR-03 | Цілісність даних | Prisma migrations; зовнішні ключі; транзакції. |
| NFR-04 | Продуктивність | Індекси Prisma; пагінація chatMessages; кеш у Zustand stores. |
| NFR-05 | UX | Адаптивний UI; SCSS design tokens; toasts замість alert(). |
| NFR-06 | Підтримуваність | Monorepo npm workspaces; Turbo; спільні DTO @soenglish/shared-types. |


### 2.1.3. Зовнішні інтерфейси

REST /api/auth, GraphQL /api/graphql, Socket.IO /chat, Google APIs, dictionary API, SMTP, Telegram.

### 2.2. Технології

Моделі Prisma: User, Language, OAuthAccount, AuthRefreshToken; ScheduledLesson, LessonMaterial, GoogleCalendarConnection; Word, WordDefinition, StudentWordCard, ReviewQueue; Lesson, Exercise, Progress (каталог); Quiz, QuizQuestion, QuizAssignment, QuizAttempt, QuizAnswer; ChatConversation, ChatParticipant, ChatMessage, ChatMessageAttachment; PracticeSession, DailyGoalCompletion, TeacherMessage, NotificationDelivery; PlatformSettings, TelegramLinkToken, StudentLearningLanguage.

| Сервіс | Призначення |
| --- | --- |
| PostgreSQL 16 | Основне сховище (Docker Compose / локально) |
| Google OAuth 2.0 | Вхід і прив’язка акаунта |
| Google Calendar API | Події уроків, Meet links |
| dictionaryapi.dev | Збагачення англомовних визначень |
| MyMemory / GTX fallback | Переклади визначень слів |
| SMTP (Nodemailer) | Welcome email, системні листи |
| Telegram Bot API | Прив’язка профілю, сповіщення (dev polling на localhost) |
| Socket.IO | Realtime чат namespace /chat |
| Mailtrap (dev) | Тестовий SMTP у розробці |


| Пакет | Призначення |
| --- | --- |
| apps/web | Next.js клієнт (@soenglish/web) |
| apps/api | NestJS API gateway (@soenglish/api) |
| data-access-prisma | Prisma schema та PrismaModule |
| module-auth | Auth, sessions, dashboard, students admin |
| module-lessons | Scheduled lessons, Google Calendar |
| module-vocabulary | Words, student cards, dictionary |
| module-flashcards | Quizzes, assignments, attempts |
| module-progress | Catalog lessons, progress |
| module-chat | Chat REST + Socket.IO gateway |
| module-notifications | Telegram, streak, teacher messages |
| module-mail | Nodemailer, React Email templates |
| shared/types | Спільні DTO для web і API |



> **[ВСТАВИТИ РИС. 4]** Структура каталогів apps/ та packages/.. *Скрін VS Code Explorer.*

*Рис. 4. Структура каталогів apps/ та packages/.*


### npm-залежності (71 пакетів)

Повний перелік — Додаток А у DOCX.

### 2.2.1–2.2.4 (детально в DOCX)

PostgreSQL — об’єктно-реляційна СУБД з підтримкою ACID-транзакцій, зовнішніх ключів, JSON-полів (sourcePayload у Word), масивів (synonyms, antonyms) та складних індексів. У SoEnglish усі персистентні дані зберігаються в одній базі, що спрощує звітність і цілісність.

Переваги для проєкту: надійність при одночасній роботі студентів і викладачів; зрілі інструменти бекапу; Prisma генерує типобезпечні запити. Типові операції — SELECT з JOIN через Prisma include, INSERT при створенні уроку, UPDATE статусу картки слова, транзакції при quiz attempt.

У docker-compose піднімається PostgreSQL 16 локально; DATABASE_URL у .env вказує connection string. Індекси на userId, date у PracticeSession, composite unique на DailyGoalCompletion зменшують час відповіді dashboard.

При захисті варто пояснити: чому не MongoDB — доменна модель сильно зв’язана (урок ↔ два User, картка ↔ Word); реляційна схема природно відображає 1:N і M:N через junction-таблиці ChatParticipant.

NestJS — серверний framework на Node.js з модульною архітектурою (Module, Controller, Provider, Guard). apps/api збирає domain modules з packages/backend/modules/*.

Dependency Injection: сервіси (DashboardService, ChatService) інжектуються в resolvers і controllers. Guards (GqlAuthGuard, AuthGuard) перевіряють JWT з cookies перед виконанням handler.

Пайпи class-validator перевіряють DTO на REST endpoints. @nestjs/schedule запускає cron (очищення chat attachments, streak alerts).

GraphQL — мова запитів і схема типів; клієнт запитує лише потрібні поля. Ендпоінт /api/graphql, code-first підхід: класи з @ObjectType і @Resolver генерують схему автоматично.

Приклад: query dashboardSummary повертає lessonsToday і vocabularyCount одним round-trip. Mutations: setDailyGoalDone, addStudentWordCard, createScheduledLesson.

Переваги: менше over-fetching порівняно з REST; єдина точка для web dashboard, vocabulary, lessons. Недолік — складніше кешування ніж REST GET; у проєкті кеш на клієнті в Zustand.

### 2.3. Порівняльна таблиця стеку

| Технологія | Роль | Альтернатива |
| PostgreSQL | Персистентність | MySQL |
| NestJS | API | Express |
| GraphQL | Запити web | REST |
| Next.js | UI routing | Vite SPA |

---

## РОЗДІЛ 3. РЕАЛІЗАЦІЯ


> **[ВСТАВИТИ РИС. 5]** ER-діаграма бази даних.. *Prisma Studio або prisma-erd.*

*Рис. 5. ER-діаграма бази даних.*


> **[ВСТАВИТИ РИС. 6]** Фрагмент schema.prisma (User, ScheduledLesson, Word).. *Скрін редактора коду.*

*Рис. 6. Фрагмент schema.prisma (User, ScheduledLesson, Word).*


### 3.2. Сервер (main.ts)

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(cookieParser());
  app.enableCors({ origin: process.env.WEB_ORIGIN, credentials: true });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}
```


> **[ВСТАВИТИ РИС. 7]** GraphQL Playground — запит dashboardSummary.. *http://localhost:3000/api/graphql*

*Рис. 7. GraphQL Playground — запит dashboardSummary.*


> **[ВСТАВИТИ РИС. 8]** Консоль API після npm run dev.. *Термінал з Nest bootstrap log.*

*Рис. 8. Консоль API після npm run dev.*


### Chat gateway

```typescript
@SubscribeMessage('message:send')
async onSend(client, payload: { conversationId?: string; body?: string }) {
  const message = await this.chat.sendMessage(userId, payload.conversationId, payload.body);
  this.broadcastNewMessage(message, payload.conversationId);
  return { ok: true, message };
}
```

### 3.3. Клієнт


> **[ВСТАВИТИ РИС. 9]** Сторінка /login.. *Браузер localhost:4200/login*

*Рис. 9. Сторінка /login.*


> **[ВСТАВИТИ РИС. 10]** Dashboard студента з live-даними.. */dashboard*

*Рис. 10. Dashboard студента з live-даними.*


> **[ВСТАВИТИ РИС. 11]** Календар і модальне вікно уроку.. */calendar*

*Рис. 11. Календар і модальне вікно уроку.*


> **[ВСТАВИТИ РИС. 12]** Сторінка Vocabulary.. */vocabulary*

*Рис. 12. Сторінка Vocabulary.*


> **[ВСТАВИТИ РИС. 13]** Practice hub / Quiz.. */practice*

*Рис. 13. Practice hub / Quiz.*


> **[ВСТАВИТИ РИС. 14]** Чат — thread і вкладення.. */chat*

*Рис. 14. Чат — thread і вкладення.*


> **[ВСТАВИТИ РИС. 15]** Профіль / Admin students.. */profile, /students*

*Рис. 15. Профіль / Admin students.*


### 3.4. Інтеграція

```javascript
// next.config.mjs
async rewrites() {
  return [{ source: '/api/:path*', destination: `${apiProxyTarget}/api/:path*` }];
}
```


> **[ВСТАВИТИ РИС. 16]** DevTools Network: GraphQL + WebSocket.. *F12 на /chat*

*Рис. 16. DevTools Network: GraphQL + WebSocket.*


> **[ВСТАВИТИ РИС. 21]** Sidebar для ролі teacher vs student.. *Порівняння двох акаунтів*

*Рис. 21. Sidebar для ролі teacher vs student.*


### 3.6. React / Next.js — хуки

| Хук | Призначення | Приклад |
| --- | --- | --- |
| useState | Локальний стан компонента (форма чату, модалки, toggle UI). | ChatThread (input), WordDetailsModal, TelegramConnectButton |
| useEffect | Побічні ефекти: fetch при mount, підписки Socket.IO, sync URL. | useChatSocket, AuthProvider, dashboard fetchDashboard, AuthGate |
| useMemo | Мемоізація обчислень (фільтр уроків «сьогодні», hero banner, quiz options). | dashboard/page.tsx, useProfileLiveStats, lessons/page |
| useCallback | Стабільні колбеки для дочірніх компонентів і залежностей effect. | LessonVocabularyAddPanel, useLessonEditor |
| useRef | Посилання на DOM (file input, emoji picker) без ре-рендеру. | ChatThread, ChatEmojiPicker, lessons/page |
| useLayoutEffect | Вимір DOM до paint (позиція tooltip). | Tooltip.tsx |
| useShallow (Zustand) | Підписка на кілька полів store без зайвих ре-рендерів. | auth-context useAuth |


| Next.js | Призначення | Приклад |
| --- | --- | --- |
| useRouter | Програмна навігація після login, redirect з AuthGate. | AuthGate, profile/page, calendar |
| usePathname | Поточний шлях для підсвітки меню, умов layout. | AppShell, AuthGate |
| useSearchParams | Query-параметри (вкладки профілю ?tab=). | profile/page, lessons/page |
| use client | Директива App Router: компонент лише в браузері (stores, hooks). | Усі сторінки з Zustand/GraphQL |


| Custom hook | Призначення | Файл |
| --- | --- | --- |
| useAuth / useOptionalAuth | Сесія користувача з auth-store (login, logout, refresh). | lib/auth-context.tsx |
| useChatSocket | Підключення Socket.IO, message:new, conversation:join. | hooks/use-chat-socket.ts |
| useChatNavBadge | Непрочитані чати для Sidebar. | hooks/use-chat-nav-badge.ts |
| useProfileLiveStats | Агрегація dashboard + lessons + vocabulary для профілю. | hooks/use-profile-live-stats.ts |
| useLessonPartyOptions | Список teacher/student для модалки уроку. | hooks/use-lesson-party-options.ts |
| useScheduledLessonPersistence | CRUD уроку через lessons-store + GraphQL. | hooks/use-scheduled-lesson-persistence.ts |
| usePracticeNavBadge | Лічильники pending quiz/vocab на /practice. | hooks/use-practice-nav-badge.ts |
| useViewerLanguageIds | Мови переглядача для перекладів слів. | hooks/use-viewer-language-ids.ts |


### 3.7. Основний функціонал

Реєстрація лише через адміністратора (немає публічного sign-up). Login: email + password → POST /api/auth/login → httpOnly cookies soenglish_at / soenglish_rt.

Google OAuth: redirect на Google, callback на API, встановлення cookies, redirect на /dashboard. Refresh token зберігається хешованим у AuthRefreshToken.

AuthGate обгортає AppShell: якщо немає сесії — redirect /login. useAuth() надає user.role для canView() і role matrix.

Глобальний Word + персональні StudentWordCard. Lookup через dictionaryapi.dev; переклади MyMemory/LibreTranslate. Статуси: new, repeated, mistakes_work, learned.

ReviewQueue і nextReviewAt реалізують spaced repetition. Сторінка /vocabulary — таблиця карток, WordDetailsModal, додавання слова.

GraphQL: vocabularyOverview, studentVocabulary, addStudentWordCard, updateCardStatus, lookupWord.

Direct chat (directKey унікальний для пари) і group (admin створює). ChatVisibilityService обмежує, хто кому може писати.

Повідомлення через Socket.IO; вкладення через REST multipart, TTL 24 години. ChatInbox + ChatThread UI; emoji picker.

*Повний опис усіх модулів (уроки, квізи, dashboard, admin) — у DOCX, розділ 3.7.*

---

## РОЗДІЛ 4. ТЕСТУВАННЯ

| ID | Сценарій | Метод | Результат |
| --- | --- | --- | --- |
| T-01 | Login student | UI /api/auth | Редірект на /dashboard, cookies встановлені |
| T-02 | dashboardSummary | GraphQL | Повертає lessonsToday, vocabularyCount |
| T-03 | Створення уроку | UI Calendar | Урок у scheduledLessons |
| T-04 | addStudentWordCard | GraphQL | Картка в studentVocabulary |
| T-05 | generateQuiz | GraphQL | Quiz з питаннями |
| T-06 | message:send | Socket.IO | Повідомлення в thread + inbox update |
| T-07 | Upload chat attachment | REST POST | Файл доступний GET до expiresAt |
| T-08 | setDailyGoalDone | GraphQL mutation | Стан goal оновлено |
| T-09 | Typecheck | npm run typecheck | Без помилок у змінених пакетах |



> **[ВСТАВИТИ РИС. 17]** Postman/Insomnia — POST /api/auth/login.. *Колекція запитів*

*Рис. 17. Postman/Insomnia — POST /api/auth/login.*


> **[ВСТАВИТИ РИС. 18]** Успішна відправка повідомлення в чаті.. */chat*

*Рис. 18. Успішна відправка повідомлення в чаті.*


> **[ВСТАВИТИ РИС. 19]** Toast помилки валідації (опційно).. *UI*

*Рис. 19. Toast помилки валідації (опційно).*


---

## СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ

1. NestJS Documentation. — URL: https://docs.nestjs.com/ (дата звернення: 2026).
2. Next.js Documentation. — URL: https://nextjs.org/docs (дата звернення: 2026).
3. Prisma Documentation. — URL: https://www.prisma.io/docs (дата звернення: 2026).
4. PostgreSQL Documentation. — URL: https://www.postgresql.org/docs/ (дата звернення: 2026).
5. GraphQL Specification. — URL: https://spec.graphql.org/ (дата звернення: 2026).
6. Socket.IO Documentation. — URL: https://socket.io/docs/v4/ (дата звернення: 2026).
7. React Documentation. — URL: https://react.dev/ (дата звернення: 2026).
8. TypeScript Handbook. — URL: https://www.typescriptlang.org/docs/ (дата звернення: 2026).
9. Google Calendar API. — URL: https://developers.google.com/calendar (дата звернення: 2026).
10. Google Identity OAuth 2.0. — URL: https://developers.google.com/identity/protocols/oauth2 (дата звернення: 2026).
11. MDN Web Docs — HTTP cookies. — URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies (дата звернення: 2026).
12. Zustand. — URL: https://zustand.docs.pmnd.rs/ (дата звернення: 2026).
13. Apollo Server. — URL: https://www.apollographql.com/docs/apollo-server/ (дата звернення: 2026).
14. Turborepo. — URL: https://turbo.build/repo/docs (дата звернення: 2026).
15. Фowler M. Patterns of Enterprise Application Architecture. — Addison-Wesley, 2002.

---

## ДОДАТКИ

### Додаток А — npm (71)

| Пакет | Версія | Workspace |
| --- | --- | --- |
| @apollo/server | ^5.5.1 | soenglish |
| @as-integrations/express5 | ^1.1.2 | soenglish |
| @eslint/js | ^9.8.0 | soenglish |
| @nestjs/apollo | ^13.4.0 | soenglish |
| @nestjs/common | 11.1.19 | api, soenglish |
| @nestjs/core | 11.1.19 | api, soenglish |
| @nestjs/graphql | ^13.4.0 | soenglish |
| @nestjs/platform-express | 11.1.19 | api, soenglish |
| @nestjs/platform-socket.io | ^11.0.0 | soenglish |
| @nestjs/schedule | ^6.0.0 | soenglish |
| @nestjs/schematics | ^11.0.0 | soenglish |
| @nestjs/testing | ^11.0.0 | soenglish |
| @nestjs/websockets | ^11.0.0 | soenglish |
| @next/eslint-plugin-next | ^16.1.6 | soenglish |
| @prisma/adapter-pg | ^7.8.0 | soenglish |
| @prisma/client | 7.7.0 | api, soenglish |
| @react-email/components | ^1.0.12 | soenglish, @soenglish/email-templates |
| @react-email/render | ^2.0.8 | soenglish, @soenglish/email-templates |
| @soenglish/email-templates | * | @soenglish/module-mail |
| @swc-node/register | ~1.11.1 | soenglish |
| @swc/cli | ~0.8.0 | soenglish |
| @swc/core | ~1.15.5 | soenglish |
| @swc/helpers | ~0.5.18 | soenglish |
| @types/bcryptjs | ^2.4.6 | soenglish |
| @types/cookie-parser | ^1.4.10 | soenglish |
| @types/jsonwebtoken | ^9.0.10 | soenglish |
| @types/node | 20.19.9 | soenglish |
| @types/nodemailer | ^8.0.0 | soenglish |
| @types/react | ^19.0.0 | soenglish |
| @types/react-dom | ^19.0.0 | soenglish |
| bcryptjs | ^3.0.3 | soenglish |
| class-transformer | ^0.5.1 | soenglish |
| class-validator | ^0.15.1 | soenglish |
| cookie-parser | ^1.4.7 | soenglish |
| date-fns | ^4.1.0 | @soenglish/web, soenglish |
| date-fns-tz | ^3.2.0 | @soenglish/web, soenglish |
| docx | ^9.6.1 | soenglish |
| eslint | ^9.8.0 | soenglish |
| eslint-config-next | ^16.1.6 | soenglish |
| eslint-config-prettier | ^10.0.0 | soenglish |
| eslint-plugin-import | 2.31.0 | soenglish |
| eslint-plugin-jsx-a11y | 6.10.1 | soenglish |
| eslint-plugin-react | 7.35.0 | soenglish |
| eslint-plugin-react-hooks | 5.0.0 | soenglish |
| google-auth-library | ^10.6.2 | soenglish |
| googleapis | ^171.4.0 | soenglish |
| graphql | ^16.14.0 | soenglish |
| graphql-request | ^7.4.0 | @soenglish/web, soenglish |
| jsonwebtoken | ^9.0.3 | soenglish |
| lucide-react | ^1.8.0 | @soenglish/web, soenglish |
| next | ~16.1.6 | soenglish |
| nodemailer | ^8.0.7 | soenglish |
| prettier | ~3.6.2 | soenglish |
| prisma | ^7.7.0 | soenglish |
| react | ^19.0.0 | soenglish |
| react-dom | ^19.0.0 | soenglish |
| recharts | ^3.8.1 | soenglish |
| reflect-metadata | 0.1.14 | api, soenglish |
| rxjs | 7.8.2 | api, soenglish |
| sass | 1.62.1 | soenglish |
| socket.io | ^4.8.1 | soenglish |
| socket.io-client | ^4.8.1 | soenglish |
| ts-node | ^10.9.2 | soenglish |
| tsc-alias | ^1.8.16 | soenglish |
| tsconfig-paths | ^4.2.0 | soenglish |
| tslib | ^2.3.0 | soenglish |
| tsx | ^4.20.6 | soenglish |
| turbo | ^2.5.5 | soenglish |
| typescript | ~5.9.2 | soenglish |
| typescript-eslint | ^8.40.0 | soenglish |
| zustand | ^5.0.12 | soenglish |



> **[ВСТАВИТИ РИС. 20]** Повна ER-діаграма (додаток).. *Prisma*

*Рис. 20. Повна ER-діаграма (додаток).*

