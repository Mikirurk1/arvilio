/** Structured content for SoEnglish coursework (MD + DOCX). */

export const FR_STUDENT = [
  ['FR-S01', 'Авторизація', 'Вхід за email/паролем або Google OAuth; сесія в httpOnly cookies.'],
  ['FR-S02', 'Dashboard', 'Статистика уроків і словника; daily goals; learning streak; word of the day.'],
  ['FR-S03', 'Календар і уроки', 'Перегляд запланованих уроків 1:1; посилання Google Meet; матеріали та ДЗ.'],
  ['FR-S04', 'Словник', 'Особисті картки слів; статуси mastery; переклади; lookup через dictionary API.'],
  ['FR-S05', 'Practice', 'Вправи зі словником; квізи; облік practice sessions.'],
  ['FR-S06', 'Квізи', 'Проходження призначених quiz; фіксація спроб і відповідей.'],
  ['FR-S07', 'Чат', 'Direct і group conversations; Socket.IO; вкладення файлів (TTL 24 год).'],
  ['FR-S08', 'Профіль', 'Редагування профілю; мови навчання; Telegram; сповіщення.'],
];

export const FR_TEACHER = [
  ['FR-T01', 'Розклад уроків', 'CRUD ScheduledLesson; recurrence; синхронізація Google Calendar.'],
  ['FR-T02', 'Студенти', 'Список закріплених студентів; перегляд прогресу.'],
  ['FR-T03', 'Квізи', 'Генерація та призначення quiz студентам.'],
  ['FR-T04', 'Повідомлення', 'TeacherMessage (email/Telegram) з профілю студента.'],
  ['FR-T05', 'Чат', 'Листування зі студентами згідно ChatVisibilityService.'],
];

export const FR_ADMIN = [
  ['FR-A01', 'Користувачі', 'Створення/видалення студентів; admin users (GraphQL AdminResolver).'],
  ['FR-A02', 'Групові чати', 'createGroupConversation для адміністраторів.'],
  ['FR-A03', 'Системна пошта', 'SMTP status; test welcome email (super-admin).'],
  ['FR-A04', 'Словникові провайдери', 'Налаштування dictionary provider у PlatformSettings.'],
];

export const NFR = [
  ['NFR-01', 'Безпека', 'JWT access/refresh у httpOnly cookies; bcrypt для паролів; GqlAuthGuard.'],
  ['NFR-02', 'Розділення ролей', 'STUDENT, TEACHER, ADMIN, SUPER_ADMIN; client role matrix.'],
  ['NFR-03', 'Цілісність даних', 'Prisma migrations; зовнішні ключі; транзакції.'],
  ['NFR-04', 'Продуктивність', 'Індекси Prisma; пагінація chatMessages; кеш у Zustand stores.'],
  ['NFR-05', 'UX', 'Адаптивний UI; SCSS design tokens; toasts замість alert().'],
  ['NFR-06', 'Підтримуваність', 'Monorepo npm workspaces; Turbo; спільні DTO @soenglish/shared-types.'],
];

export const SERVICES = [
  ['PostgreSQL 16', 'Основне сховище (Docker Compose / локально)'],
  ['Google OAuth 2.0', 'Вхід і прив’язка акаунта'],
  ['Google Calendar API', 'Події уроків, Meet links'],
  ['dictionaryapi.dev', 'Збагачення англомовних визначень'],
  ['MyMemory / GTX fallback', 'Переклади визначень слів'],
  ['SMTP (Nodemailer)', 'Welcome email, системні листи'],
  ['Telegram Bot API', 'Прив’язка профілю, сповіщення (dev polling на localhost)'],
  ['Socket.IO', 'Realtime чат namespace /chat'],
  ['Mailtrap (dev)', 'Тестовий SMTP у розробці'],
];

export const WORKSPACE_PACKAGES = [
  ['apps/web', 'Next.js клієнт (@soenglish/web)'],
  ['apps/api', 'NestJS API gateway (@soenglish/api)'],
  ['data-access-prisma', 'Prisma schema та PrismaModule'],
  ['module-auth', 'Auth, sessions, dashboard, students admin'],
  ['module-lessons', 'Scheduled lessons, Google Calendar'],
  ['module-vocabulary', 'Words, student cards, dictionary'],
  ['module-flashcards', 'Quizzes, assignments, attempts'],
  ['module-progress', 'Catalog lessons, progress'],
  ['module-chat', 'Chat REST + Socket.IO gateway'],
  ['module-notifications', 'Telegram, streak, teacher messages'],
  ['module-mail', 'Nodemailer, React Email templates'],
  ['shared/types', 'Спільні DTO для web і API'],
];

export const TEST_SCENARIOS = [
  ['T-01', 'Login student', 'UI /api/auth', 'Редірект на /dashboard, cookies встановлені'],
  ['T-02', 'dashboardSummary', 'GraphQL', 'Повертає lessonsToday, vocabularyCount'],
  ['T-03', 'Створення уроку', 'UI Calendar', 'Урок у scheduledLessons'],
  ['T-04', 'addStudentWordCard', 'GraphQL', 'Картка в studentVocabulary'],
  ['T-05', 'generateQuiz', 'GraphQL', 'Quiz з питаннями'],
  ['T-06', 'message:send', 'Socket.IO', 'Повідомлення в thread + inbox update'],
  ['T-07', 'Upload chat attachment', 'REST POST', 'Файл доступний GET до expiresAt'],
  ['T-08', 'setDailyGoalDone', 'GraphQL mutation', 'Стан goal оновлено'],
  ['T-09', 'Typecheck', 'npm run typecheck', 'Без помилок у змінених пакетах'],
];

export const SOURCES = [
  'NestJS Documentation. — URL: https://docs.nestjs.com/ (дата звернення: 2026).',
  'Next.js Documentation. — URL: https://nextjs.org/docs (дата звернення: 2026).',
  'Prisma Documentation. — URL: https://www.prisma.io/docs (дата звернення: 2026).',
  'PostgreSQL Documentation. — URL: https://www.postgresql.org/docs/ (дата звернення: 2026).',
  'GraphQL Specification. — URL: https://spec.graphql.org/ (дата звернення: 2026).',
  'Socket.IO Documentation. — URL: https://socket.io/docs/v4/ (дата звернення: 2026).',
  'React Documentation. — URL: https://react.dev/ (дата звернення: 2026).',
  'TypeScript Handbook. — URL: https://www.typescriptlang.org/docs/ (дата звернення: 2026).',
  'Google Calendar API. — URL: https://developers.google.com/calendar (дата звернення: 2026).',
  'Google Identity OAuth 2.0. — URL: https://developers.google.com/identity/protocols/oauth2 (дата звернення: 2026).',
  'MDN Web Docs — HTTP cookies. — URL: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies (дата звернення: 2026).',
  'Zustand. — URL: https://zustand.docs.pmnd.rs/ (дата звернення: 2026).',
  'Apollo Server. — URL: https://www.apollographql.com/docs/apollo-server/ (дата звернення: 2026).',
  'Turborepo. — URL: https://turbo.build/repo/docs (дата звернення: 2026).',
  'Фowler M. Patterns of Enterprise Application Architecture. — Addison-Wesley, 2002.',
];

export const PRISMA_MODELS = [
  'User, Language, OAuthAccount, AuthRefreshToken',
  'ScheduledLesson, LessonMaterial, GoogleCalendarConnection',
  'Word, WordDefinition, StudentWordCard, ReviewQueue',
  'Lesson, Exercise, Progress (каталог)',
  'Quiz, QuizQuestion, QuizAssignment, QuizAttempt, QuizAnswer',
  'ChatConversation, ChatParticipant, ChatMessage, ChatMessageAttachment',
  'PracticeSession, DailyGoalCompletion, TeacherMessage, NotificationDelivery',
  'PlatformSettings, TelegramLinkToken, StudentLearningLanguage',
];

export const FIGURES = [
  [1, 'Загальна архітектура SoEnglish (Browser → Next.js → NestJS → PostgreSQL).', 'Діаграма з docs/llm-wiki/wiki/synthesis/architecture.md або draw.io.'],
  [2, 'Шари monorepo: apps/web, apps/api, packages/backend/modules.', 'Скрін дерева проєкту в IDE.'],
  [3, 'Діаграма випадків використання (Student / Teacher / Admin).', 'UML use-case у draw.io / Figma.'],
  [4, 'Структура каталогів apps/ та packages/.', 'Скрін VS Code Explorer.'],
  [5, 'ER-діаграма бази даних.', 'Prisma Studio або prisma-erd.'],
  [6, 'Фрагмент schema.prisma (User, ScheduledLesson, Word).', 'Скрін редактора коду.'],
  [7, 'GraphQL Playground — запит dashboardSummary.', 'http://localhost:3000/api/graphql'],
  [8, 'Консоль API після npm run dev.', 'Термінал з Nest bootstrap log.'],
  [9, 'Сторінка /login.', 'Браузер localhost:4200/login'],
  [10, 'Dashboard студента з live-даними.', '/dashboard'],
  [11, 'Календар і модальне вікно уроку.', '/calendar'],
  [12, 'Сторінка Vocabulary.', '/vocabulary'],
  [13, 'Practice hub / Quiz.', '/practice'],
  [14, 'Чат — thread і вкладення.', '/chat'],
  [15, 'Профіль / Admin students.', '/profile, /students'],
  [16, 'DevTools Network: GraphQL + WebSocket.', 'F12 на /chat'],
  [17, 'Postman/Insomnia — POST /api/auth/login.', 'Колекція запитів'],
  [18, 'Успішна відправка повідомлення в чаті.', '/chat'],
  [19, 'Toast помилки валідації (опційно).', 'UI'],
  [20, 'Повна ER-діаграма (додаток).', 'Prisma'],
  [21, 'Sidebar для ролі teacher vs student.', 'Порівняння двох акаунтів'],
];

export const CODE_MAIN_TS = `async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(cookieParser());
  app.enableCors({ origin: process.env.WEB_ORIGIN, credentials: true });
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 3000);
}`;

export const CODE_CHAT_GATEWAY = `@SubscribeMessage('message:send')
async onSend(client, payload: { conversationId?: string; body?: string }) {
  const message = await this.chat.sendMessage(userId, payload.conversationId, payload.body);
  this.broadcastNewMessage(message, payload.conversationId);
  return { ok: true, message };
}`;

export const CODE_NEXT_REWRITE = `// next.config.mjs
async rewrites() {
  return [{ source: '/api/:path*', destination: \`\${apiProxyTarget}/api/:path*\` }];
}`;

/** План розвитку проєкту SoEnglish (наступні етапи). */
export const DEVELOPMENT_PLAN = [
  ['1', 'Автоматизоване тестування', 'Налаштувати CI (GitHub Actions): lint, typecheck, e2e (Playwright/Cypress) на кожен PR.'],
  ['2', 'Юніт-тести', 'Покрити Jest/Vitest сервіси module-auth, vocabulary, lessons, chat; мок Prisma для ізольованих тестів.'],
  ['3', 'Доробка функціоналу', 'Закрити прогалини RBAC на API, server-side guards на web, повний Facebook OAuth, покращення LAN для Socket.IO.'],
  ['4', 'Збір даних користувачів', 'Аналітика подій (уроки, слова, квізи), опитування в продукті, розширення звітності для викладачів і адмінів.'],
  ['5', 'Оплата та фінанси', 'Інтеграція Stripe: пакети уроків, ліміти, історія платежів, контроль обороту та заборгованостей.'],
];

export const IMPROVEMENT_PATHS = [
  'Впровадження піраміди тестування: unit → integration → e2e; мінімальний coverage gate у CI.',
  'Рефакторинг критичних модулів з винесенням спільної логіки в packages/backend/core.',
  'Документація API (GraphQL schema export, OpenAPI для REST auth/chat).',
  'Спостережуваність: structured logging, health checks, Sentry для production.',
  'Оптимізація запитів Prisma (select/include, індекси під звіти dashboard).',
];

export const FUNCTIONAL_EXPANSION = [
  ['Билінг', 'Stripe Checkout / Customer Portal; прив’язка оплати до кількості запланованих уроків.'],
  ['Звітність', 'Розширені dashboard для teacher/admin: виручка, відвідуваність, прогрес словника.'],
  ['Мобільний UX', 'PWA або React Native за спільними GraphQL операціями.'],
  ['Контент', 'Імпорт готових курсів у каталог Lesson/Exercise; AI-генерація квізів.'],
  ['Інтеграції', 'Zoom альтернатива, LMS export, webhooks для CRM школ.'],
];

export const USAGE_PERSPECTIVES = [
  'Мовні школи та репетиторські центри — централізований облік 1:1 уроків, оплат і словника студентів.',
  'Університети — додаткові курси англійської з прозорим розкладом і Meet.',
  'Корпоративне навчання — B2B-акаунти, групові чати, звіти для HR.',
  'Freelance-викладачі — особистий кабінет без власної IT-інфраструктури.',
];
