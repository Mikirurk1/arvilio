/** Extended prose for ~50-page coursework (technologies, hooks, features). */

export const REACT_HOOKS_TABLE = [
  ['useState', 'Локальний стан компонента (форма чату, модалки, toggle UI).', 'ChatThread (input), WordDetailsModal, TelegramConnectButton'],
  ['useEffect', 'Побічні ефекти: fetch при mount, підписки Socket.IO, sync URL.', 'useChatSocket, AuthProvider, dashboard fetchDashboard, AuthGate'],
  ['useMemo', 'Мемоізація обчислень (фільтр уроків «сьогодні», hero banner, quiz options).', 'dashboard/page.tsx, useProfileLiveStats, lessons/page'],
  ['useCallback', 'Стабільні колбеки для дочірніх компонентів і залежностей effect.', 'LessonVocabularyAddPanel, useLessonEditor'],
  ['useRef', 'Посилання на DOM (file input, emoji picker) без ре-рендеру.', 'ChatThread, ChatEmojiPicker, lessons/page'],
  ['useLayoutEffect', 'Вимір DOM до paint (позиція tooltip).', 'Tooltip.tsx'],
  ['useShallow (Zustand)', 'Підписка на кілька полів store без зайвих ре-рендерів.', 'auth-context useAuth'],
];

export const NEXT_HOOKS_TABLE = [
  ['useRouter', 'Програмна навігація після login, redirect з AuthGate.', 'AuthGate, profile/page, calendar'],
  ['usePathname', 'Поточний шлях для підсвітки меню, умов layout.', 'AppShell, AuthGate'],
  ['useSearchParams', 'Query-параметри (вкладки профілю ?tab=).', 'profile/page, lessons/page'],
  ['use client', 'Директива App Router: компонент лише в браузері (stores, hooks).', 'Усі сторінки з Zustand/GraphQL'],
];

export const CUSTOM_HOOKS_TABLE = [
  ['useAuth / useOptionalAuth', 'Сесія користувача з auth-store (login, logout, refresh).', 'lib/auth-context.tsx'],
  ['useChatSocket', 'Підключення Socket.IO, message:new, conversation:join.', 'hooks/use-chat-socket.ts'],
  ['useChatNavBadge', 'Непрочитані чати для Sidebar.', 'hooks/use-chat-nav-badge.ts'],
  ['useProfileLiveStats', 'Агрегація dashboard + lessons + vocabulary для профілю.', 'hooks/use-profile-live-stats.ts'],
  ['useLessonPartyOptions', 'Список teacher/student для модалки уроку.', 'hooks/use-lesson-party-options.ts'],
  ['useScheduledLessonPersistence', 'CRUD уроку через lessons-store + GraphQL.', 'hooks/use-scheduled-lesson-persistence.ts'],
  ['usePracticeNavBadge', 'Лічильники pending quiz/vocab на /practice.', 'hooks/use-practice-nav-badge.ts'],
  ['useViewerLanguageIds', 'Мови переглядача для перекладів слів.', 'hooks/use-viewer-language-ids.ts'],
];

export const TECH_POSTGRESQL = [
  'PostgreSQL — об’єктно-реляційна СУБД з підтримкою ACID-транзакцій, зовнішніх ключів, JSON-полів (sourcePayload у Word), масивів (synonyms, antonyms) та складних індексів. У SoEnglish усі персистентні дані зберігаються в одній базі, що спрощує звітність і цілісність.',
  'Переваги для проєкту: надійність при одночасній роботі студентів і викладачів; зрілі інструменти бекапу; Prisma генерує типобезпечні запити. Типові операції — SELECT з JOIN через Prisma include, INSERT при створенні уроку, UPDATE статусу картки слова, транзакції при quiz attempt.',
  'У docker-compose піднімається PostgreSQL 16 локально; DATABASE_URL у .env вказує connection string. Індекси на userId, date у PracticeSession, composite unique на DailyGoalCompletion зменшують час відповіді dashboard.',
  'При захисті варто пояснити: чому не MongoDB — доменна модель сильно зв’язана (урок ↔ два User, картка ↔ Word); реляційна схема природно відображає 1:N і M:N через junction-таблиці ChatParticipant.',
];

export const TECH_PRISMA = [
  'Prisma ORM — шар між NestJS-сервісами та PostgreSQL. Схема в schema.prisma є єдиним джерелом правди про структуру таблиць; prisma migrate dev створює SQL-міграції.',
  'Prisma Client генерується командою prisma generate; типи моделей (User, ScheduledLesson) доступні в TypeScript на бекенді. Relation queries дозволяють одним запитом отримати урок з teacher і student.',
  'Enum-и (UserRole, VocabularyStatus, LessonStatus) мапляться на GraphQL string і shared DTO. Raw queries не потрібні для основного CRUD — лише для складної аналітики за потреби.',
];

export const TECH_NESTJS = [
  'NestJS — серверний framework на Node.js з модульною архітектурою (Module, Controller, Provider, Guard). apps/api збирає domain modules з packages/backend/modules/*.',
  'Dependency Injection: сервіси (DashboardService, ChatService) інжектуються в resolvers і controllers. Guards (GqlAuthGuard, AuthGuard) перевіряють JWT з cookies перед виконанням handler.',
  'Пайпи class-validator перевіряють DTO на REST endpoints. @nestjs/schedule запускає cron (очищення chat attachments, streak alerts).',
];

export const TECH_GRAPHQL = [
  'GraphQL — мова запитів і схема типів; клієнт запитує лише потрібні поля. Ендпоінт /api/graphql, code-first підхід: класи з @ObjectType і @Resolver генерують схему автоматично.',
  'Приклад: query dashboardSummary повертає lessonsToday і vocabularyCount одним round-trip. Mutations: setDailyGoalDone, addStudentWordCard, createScheduledLesson.',
  'Переваги: менше over-fetching порівняно з REST; єдина точка для web dashboard, vocabulary, lessons. Недолік — складніше кешування ніж REST GET; у проєкті кеш на клієнті в Zustand.',
];

export const TECH_SOCKETIO = [
  'Socket.IO — WebSocket з fallback на long-polling. Namespace /chat ізолює чат від інших подій. Події: conversation:join, message:send (ack), message:new, conversation:updated.',
  'Авторизація на handshake через cookies (AuthSessionService). Кімнати conv:{id} для broadcast повідомлень учасникам; user:{id} для оновлення inbox.',
  'Клієнт: socket.io-client у chat-socket.ts, NEXT_PUBLIC_SOCKET_URL вказує на API (не через Next proxy). useChatSocket підписується на події в useEffect і відписується при unmount.',
];

export const TECH_NEXTJS = [
  'Next.js 16 (App Router) — файловий роутинг у apps/web/src/app/: кожна папка з page.tsx — маршрут. layout.tsx задає AppShell для автентифікованих сторінок.',
  'Server Components за замовчуванням; сторінки з інтерактивністю мають директиву use client. next.config.mjs rewrites /api/* на Nest для cookies same-origin.',
  'redirect з / на /dashboard. Production build: next build + next start на порту 4200.',
];

export const TECH_REACT = [
  'React 19 — декларативний UI: state → render. Компоненти в components/ui перевикористовуються (Button, Field, PageHeader).',
  'Однонаправлений потік даних: батько передає props, дочірні викликають callbacks. Складний стан винесено в Zustand stores, а не prop drilling на 5 рівнів.',
  'Suspense на lessons/page для searchParams. Портали не використовуються масово — модалки в DOM дереві з CSS overlay.',
];

export const TECH_ZUSTAND = [
  'Zustand — легкий store без boilerplate Redux. create() + devtools middleware для Redux DevTools. Патерн AsyncSlice: idle | loading | success | error для кожного API-ресурсу.',
  'dashboard-store, vocabulary-store, lessons-store, chat-store, auth-store — окремі домени. fetchDashboard координує паралельні GraphQL запити.',
  'useShallow у useAuth уникає ре-рендеру при незмінних полях. Селектори (s) => s.summary зменшують підписку на весь store.',
];

export const FEATURE_AUTH = [
  'Реєстрація лише через адміністратора (немає публічного sign-up). Login: email + password → POST /api/auth/login → httpOnly cookies soenglish_at / soenglish_rt.',
  'Google OAuth: redirect на Google, callback на API, встановлення cookies, redirect на /dashboard. Refresh token зберігається хешованим у AuthRefreshToken.',
  'AuthGate обгортає AppShell: якщо немає сесії — redirect /login. useAuth() надає user.role для canView() і role matrix.',
];

export const FEATURE_LESSONS = [
  'ScheduledLesson — ядро продукту: дата, startTime, duration, teacherId, studentId, status (planned/completed/cancelled), recurrence, materials[], homework.',
  'Календар (/calendar) відображає сітку; LessonModal — створення/редагування. Google Calendar API синхронізує подію та googleMeetUrl.',
  'Сторінка /lessons/[id] — деталі, матеріали, vocabulary panel для уроку. Backend фільтрує уроки за роллю (student бачить свої, teacher — свої як викладач).',
];

export const FEATURE_VOCABULARY = [
  'Глобальний Word + персональні StudentWordCard. Lookup через dictionaryapi.dev; переклади MyMemory/LibreTranslate. Статуси: new, repeated, mistakes_work, learned.',
  'ReviewQueue і nextReviewAt реалізують spaced repetition. Сторінка /vocabulary — таблиця карток, WordDetailsModal, додавання слова.',
  'GraphQL: vocabularyOverview, studentVocabulary, addStudentWordCard, updateCardStatus, lookupWord.',
];

export const FEATURE_QUIZ = [
  'Quiz з питаннями (multiple choice); QuizAssignment призначає студенту; QuizAttempt фіксує спробу. generateQuiz mutation з vocabulary або manual.',
  '/practice — hub; /practice/quiz — проходження; /quiz — список для staff. Результати зберігаються в QuizAnswer.',
];

export const FEATURE_CHAT = [
  'Direct chat (directKey унікальний для пари) і group (admin створює). ChatVisibilityService обмежує, хто кому може писати.',
  'Повідомлення через Socket.IO; вкладення через REST multipart, TTL 24 години. ChatInbox + ChatThread UI; emoji picker.',
];

export const FEATURE_DASHBOARD = [
  'dashboardSummary: lessonsToday, vocabularyCount, reviewCount за роллю. Daily goals — 4 цілі на день, toggle через setDailyGoalDone.',
  'learningStreak + wordOfDay (student). Hero banner: урок сьогодні → vocab review → /practice. Scheduled lessons list filter date===today.',
  'dashboard-store (Zustand) викликає fetchDashboard при mount сторінки: Promise.all для summary, goals, streak, wordOfDay, lessons, vocabulary — мінімізує waterfall запитів.',
  'Викладач бачить інший набір карток (без WOD, акцент на студентах і уроках). Компоненти sections.tsx розділяють UI за role з props userRole.',
];

export const FEATURE_ADMIN = [
  'Admin: CRUD students через GraphQL createAdminUser/deleteAdminUser. /students — список, /students/[id] — профіль, TeacherMessage.',
  'Super-admin: CLI super-admin.ts, system mail, PlatformSettings. Sidebar ховає /students для student.',
];

/** Додаткові абзаци для §3.6 — усний захист «як працює хук». */
export const HOOKS_DEFENSE = [
  'Правила хуків React: викликати лише на верхньому рівні функціонального компонента або custom hook, не в циклах і не в умовах. Порушення ламає порядок внутрішнього стану React і призводить до помилок «Rendered more hooks than during the previous render».',
  'useState повертає [value, setValue]. setValue може приймати функцію updater (prev => prev + 1) для атомарного оновлення при кількох подіях. У ChatThread стан inputMessage скидається після успішного message:send через ack callback.',
  'useEffect(setup, deps): якщо deps порожній [] — effect один раз після mount (типово fetchDashboard). Якщо deps містить conversationId — effect перезапускається при зміні чату; cleanup function відписує socket listeners, щоб уникнути memory leak.',
  'useMemo(fn, deps) обчислює fn лише коли змінились deps; інакше повертає кешоване значення. На dashboard це зменшує перерахунок todayLessons при кожному ре-рендері батьківського layout.',
  'useCallback(fn, deps) схожий на useMemo, але кешує функцію. Потрібен, коли дочірній компонент обгорнутий у React.memo або коли fn у залежностях іншого useEffect.',
  'useRef(initial) зберігає .current між рендерами без тригеру ре-рендеру. Використовується для DOM (focus input) і для mutable flags (isMounted) у async fetch.',
  'Zustand useShallow — порівнює shallow equality об’єкта селектора; якщо user.id і user.role не змінились, компонент не ре-рендериться, хоча інші поля store оновились.',
  'Next.js useRouter().push("/login") — клієнтська навігація без повного reload. replace() не додає запис в history — зручно після OAuth callback.',
  'Suspense + useSearchParams: Next 15 вимагає обгортки, бо search params можуть бути асинхронними на сервері; fallback показує skeleton до готовності params.',
];

/** Ключові GraphQL операції для захисту. */
export const GRAPHQL_OPS_TABLE = [
  ['dashboardSummary', 'Query', 'Агрегат для головної: уроки, словник, review'],
  ['dailyGoals / setDailyGoalDone', 'Query / Mutation', 'Чотири цілі дня, toggle виконання'],
  ['learningStreak / wordOfDay', 'Query', 'Streak і слово дня (student)'],
  ['scheduledLessons / createScheduledLesson', 'Query / Mutation', 'CRUD розкладу 1:1'],
  ['studentVocabulary / addStudentWordCard', 'Query / Mutation', 'Особистий словник'],
  ['lookupWord', 'Query', 'Зовнішній dictionary + переклад'],
  ['generateQuiz / submitQuizAttempt', 'Mutation', 'Квізи та фіксація спроби'],
  ['chatConversations / chatMessages', 'Query', 'Inbox і історія (REST+socket для send)'],
  ['createAdminUser', 'Mutation', 'Адмін створює студента'],
];

/** Маршрути web-додатку. */
export const ROUTES_TABLE = [
  ['/login', 'Публічна', 'Email/password, Google OAuth'],
  ['/dashboard', 'Auth', 'Hero, goals, streak, WOD, lessons today'],
  ['/calendar', 'Auth', 'Сітка уроків, LessonModal'],
  ['/lessons', 'Auth', 'Список уроків, фільтри'],
  ['/lessons/[id]', 'Auth', 'Деталі уроку, матеріали, vocab panel'],
  ['/vocabulary', 'Auth', 'Картки слів, модалка деталей'],
  ['/practice', 'Auth', 'Hub: vocab review + quiz links'],
  ['/practice/quiz', 'Auth', 'Проходження квізу'],
  ['/quiz', 'Staff', 'Список/генерація квізів'],
  ['/chat', 'Auth', 'Inbox + thread (Socket.IO)'],
  ['/students', 'Admin/Teacher', 'Список студентів'],
  ['/admin', 'Admin', 'Системні налаштування'],
  ['/profile', 'Auth', 'Профіль, мови, Telegram'],
];

export const TECH_TYPESCRIPT = [
  'TypeScript — надмножина JavaScript зі статичними типами. У monorepo спільний tsconfig.base.json; кожен пакет extends і має власний outDir.',
  'Інтерфейси DTO (DashboardSummaryDto, StudentWordCardDto) живуть у packages/shared/types і імпортуються в Nest resolvers та web stores — зміна поля в одному місці підсвічує помилки скрізь.',
  'strict: true, noImplicitAny зменшують runtime-помилки. Path aliases @soenglish/module-auth резолвляться через tsc-alias після компіляції API.',
];

export const TECH_JWT_COOKIES = [
  'Access token (JWT) короткоживучий; refresh token довший і зберігається в БД у хешованому вигляді. Cookies httpOnly + Secure (production) + SameSite=Lax захищають від XSS-витоку токена в localStorage.',
  'GqlAuthGuard читає cookie, валідує JWT, підставляє req.user у GraphQL context. Без валідної сесії mutations createScheduledLesson повертають Unauthorized.',
  'Refresh flow: POST /api/auth/refresh оновлює access без повторного login; при простроченні refresh — redirect на /login.',
];

export const DEPLOYMENT_NOTES = [
  'Локально: docker compose up postgres, npm run dev (turbo піднімає web:4200 і api:3000). .env копіюється з .env.example; секрети JWT_GENERATION_SECRET, GOOGLE_CLIENT_* обов’язкові для OAuth.',
  'Production (план): окремі контейнери web і api за reverse proxy (nginx); DATABASE_URL на managed PostgreSQL; WEB_ORIGIN і NEXT_PUBLIC_SOCKET_URL на публічний домен.',
  'Збірка: npm run build у корені turbo — next build + nest build. Міграції: prisma migrate deploy на CI перед стартом API.',
];

export const STACK_EXTENDED_TABLE = [
  ['TypeScript', 'Типи клієнт/сервер/DTO', 'JavaScript без типів'],
  ['JWT + cookies', 'Сесія API', 'Session store Redis'],
  ['class-validator', 'Валідація REST DTO', 'Zod на API'],
  ['@nestjs/graphql', 'Code-first schema', 'Apollo standalone'],
  ['socket.io-client', 'Браузерний чат', 'native WebSocket'],
  ['lucide-react', 'Іконки UI', 'Font Awesome'],
  ['SCSS Modules', 'Ізольовані стилі', 'Tailwind only'],
  ['Turborepo', 'Паралельний dev/build', 'Nx'],
  ['React Email', 'HTML-листи welcome', 'Hand-written HTML'],
  ['bcrypt', 'Хеш паролів', 'argon2'],
];
