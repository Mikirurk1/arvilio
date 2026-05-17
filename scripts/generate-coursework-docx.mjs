#!/usr/bin/env node
/**
 * Generates docs/coursework/Курсова_SoEnglish.docx and Курсова_SoEnglish.md
 * Run: node scripts/generate-coursework-docx.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  PageBreak,
  BorderStyle,
  TableOfContents,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import {
  FR_STUDENT,
  FR_TEACHER,
  FR_ADMIN,
  NFR,
  SERVICES,
  WORKSPACE_PACKAGES,
  TEST_SCENARIOS,
  SOURCES,
  PRISMA_MODELS,
  FIGURES,
  CODE_MAIN_TS,
  CODE_CHAT_GATEWAY,
  CODE_NEXT_REWRITE,
  DEVELOPMENT_PLAN,
  IMPROVEMENT_PATHS,
  FUNCTIONAL_EXPANSION,
  USAGE_PERSPECTIVES,
} from '../docs/coursework/coursework-data.mjs';
import {
  REACT_HOOKS_TABLE,
  NEXT_HOOKS_TABLE,
  CUSTOM_HOOKS_TABLE,
  TECH_POSTGRESQL,
  TECH_PRISMA,
  TECH_NESTJS,
  TECH_GRAPHQL,
  TECH_SOCKETIO,
  TECH_NEXTJS,
  TECH_REACT,
  TECH_ZUSTAND,
  FEATURE_AUTH,
  FEATURE_LESSONS,
  FEATURE_VOCABULARY,
  FEATURE_QUIZ,
  FEATURE_CHAT,
  FEATURE_DASHBOARD,
  FEATURE_ADMIN,
  HOOKS_DEFENSE,
  GRAPHQL_OPS_TABLE,
  ROUTES_TABLE,
  TECH_TYPESCRIPT,
  TECH_JWT_COOKIES,
  DEPLOYMENT_NOTES,
  STACK_EXTENDED_TABLE,
} from '../docs/coursework/coursework-expanded.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs/coursework');
const META = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'title-meta.json'), 'utf8'));
const DEPS = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'dependencies.json'), 'utf8'));

const FONT = 'Times New Roman';
const SIZE = 28; // half-points → 14pt

function run(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: SIZE, ...opts });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { line: 360, after: 120 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [run(text, opts)],
  });
}

function pMulti(lines) {
  return lines.map((t) => p(t));
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [run(text, { bold: true })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 120 },
    children: [run(text, { bold: true })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 160, after: 100 },
    children: [run(text, { bold: true })],
  });
}

function figure(n, title, hint) {
  return [
    p(''),
    new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [
        run(`[ВСТАВИТИ РИС. ${n}] `, { bold: true, italics: true }),
        run(`${title}. Рекомендація: ${hint}. Роздільність ≥1280 px.`, { italics: true }),
      ],
    }),
    p(`Рис. ${n}. ${title}`, { center: true }),
    p(''),
  ];
}

function makeTable(headers, rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
  const borders = { top: border, bottom: border, left: border, right: border };
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          borders,
          width: { size: 100 / headers.length, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ children: [run(h, { bold: true })] })],
        }),
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              borders,
              children: [new Paragraph({ children: [run(String(cell))] })],
            }),
        ),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [run(text, { font: 'Courier New', size: 22 })],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { after: 60 },
    bullet: { level: 0 },
    children: [run(text)],
  });
}

/** Кілька абзаців підряд з масиву рядків. */
function prose(lines) {
  return lines.map((text) => p(text));
}

function buildTitlePage() {
  const center = (t, bold = false) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [run(t, { bold })],
    });
  return [
    center(META.ministry),
    center(META.university, true),
    center(META.institute),
    center(META.department),
    p(''),
    center('Курсова робота', true),
    center(`з дисципліни: «${META.discipline}»`),
    center('на тему:', true),
    center(`«${META.topic}»`, true),
    p(''),
    center('Виконав(ла):'),
    center(`ст. гр. ${META.group}`),
    ...META.authors.map((a) => center(a)),
    p(''),
    center('Прийняв(ла):'),
    center(META.supervisor),
    p(''),
    p(''),
    center(`${META.city} — ${META.year} р.`),
  ];
}

/** Зміст (поле Word — оновити вручну: ПКМ → Оновити поле). */
function buildTableOfContents() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [run('ЗМІСТ', { bold: true, size: 32 })],
    }),
    new TableOfContents(' ', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    p(
      'Примітка: відкрийте документ у Microsoft Word і оновіть зміст (правий клік по таблиці → «Оновити поле» → «Оновити всю таблицю»), щоб з’явилися номери сторінок.',
      { center: false },
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function createPageFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          run('— '),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: SIZE }),
          run(' —'),
        ],
      }),
    ],
  });
}

/** Розділи на початку: план розвитку, покращення, перспективи. */
function sectionRoadmap() {
  return [
    h1('ШЛЯХИ ПОКРАЩЕННЯ ТА ПЛАН РОЗВИТКУ ПРОЄКТУ'),
    p(
      'Поточна версія SoEnglish є робочим MVP для демонстрації архітектури та основних сценаріїв навчання. Нижче наведено пріоритетний план подальшого розвитку, узгоджений із технічним боргом репозиторію (відсутність автоматизованих тестів, неповний billing, частковий RBAC на клієнті).',
    ),
    h2('План розвитку проєкту'),
    p('Таблиця. Етапи розвитку SoEnglish'),
    makeTable(['Етап', 'Напрям', 'Зміст робіт'], DEVELOPMENT_PLAN),
    p(''),
    h2('Шляхи технічного покращення'),
    ...IMPROVEMENT_PATHS.map((t) => bullet(t)),
    p(''),
    h1('РОЗШИРЕННЯ ФУНКЦІОНАЛУ'),
    p(
      'Окрім закриття наявних прогалин, продукт розширюватиметься в бізнес-логіці та інтеграціях. Ключовий пріоритет — модуль оплати для контролю кількості уроків і фінансового обігу між студентом, школою та викладачем.',
    ),
    makeTable(['Напрям', 'Опис'], FUNCTIONAL_EXPANSION),
    p(''),
    h1('ПЕРСПЕКТИВИ ВИКОРИСТАННЯ'),
    p(
      'Платформа орієнтована на організації, де важлива поєднана цінність живого заняття та цифрового супроводу (словник, квізи, чат). Масштабування передбачає multi-tenant (кілька шкіл в одному інстансі) та white-label.',
    ),
    ...USAGE_PERSPECTIVES.map((t) => bullet(t)),
    p(
      'Збір зворотного зв’язку та телеметрії дозволить пріоритизувати roadmap: які типи уроків, словникові режими та звіти найбільше запитують реальні користувачі.',
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionIntro() {
  const blocks = [
    h1('АНОТАЦІЯ'),
    p(
      'Курсова робота присвячена проектуванню та практичній реалізації веб-платформи SoEnglish для дистанційного навчання англійської мови. Система охоплює індивідуальні уроки 1:1 з інтеграцією Google Meet, персональний словник із spaced repetition, генерацію та проходження квізів, календар занять, dashboard зі streak і daily goals, а також realtime-чат між учасниками навчального процесу.',
    ),
    p(
      'Рівень зберігання даних реалізовано на PostgreSQL із ORM Prisma. Серверна частина побудована на NestJS (REST + GraphQL + Socket.IO), клієнтська — на Next.js 16 та React 19. У роботі наведено вимоги, архітектуру monorepo, опис реалізації та результати тестування.',
    ),
    p(
      'Окремі підрозділи деталізують технології стеку (§2.2), порівняльну характеристику інструментів (§2.3), хуки React/Next.js і власні хуки проєкту (§3.6), а також покроковий опис основного функціоналу за ролями (§3.7) — матеріал для усного захисту курсової.',
    ),
    new Paragraph({ children: [new PageBreak()] }),
    h1('ВСТУП'),
    p(
      'Володіння англійською мовою є критичним фактором професійного та академічного успіху. Традиційні формати навчання (лише офлайн-заняття та розрізнені інструменти — месенджери, таблиці, окремі сервіси для слів) ускладнюють координацію між студентом і викладачем та знижують прозорість прогресу.',
    ),
    p(
      'Метою проєкту SoEnglish є створення єдиного веб-застосунку, який об’єднує розклад уроків, словникову роботу, практику, оцінювання через квізи та комунікацію в чаті. Система підтримує ролі student, teacher, admin і super_admin із різними правами доступу.',
    ),
    p(
      'Об’єкт дослідження — процес організації дистанційного навчання англійської мови в форматі 1:1. Предмет — методи та засоби проектування інформаційної системи на базі сучасного JavaScript-стеку. Практична значущість полягає у готовому програмному комплексі, який можна розгортати в навчальному закладі або мовній школі.',
    ),
    p(
      'У роботі вирішено такі завдання: провести аналіз предметної області; сформулювати функціональні та нефункціональні вимоги; спроєктувати базу даних і архітектуру; реалізувати серверні модулі та клієнтський інтерфейс; інтегрувати зовнішні сервіси (Google, словники, пошта); виконати тестування основних сценаріїв.',
    ),
    p(
      'Структура роботи: план розвитку та перспективи; Розділ 1 — постановка завдання; Розділ 2 — вимоги та інструменти; Розділ 3 — реалізація; Розділ 4 — тестування; додатки містять перелік залежностей і інструкцію запуску.',
    ),
    ...figure(1, 'Загальна схема системи SoEnglish', FIGURES[0][2]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
  return blocks;
}

function section1() {
  return [
    h1('РОЗДІЛ 1. ПОСТАНОВКА ЗАВДАННЯ'),
    h2('1.1. Визначення вхідних даних для проєкту'),
    p(
      'Вхідні дані включають: облікові записи користувачів (email, роль, профіль, timezone); заплановані уроки (дата, час, teacher/student, статус, матеріали, homework); глобальний словник Word і персональні StudentWordCard; квізи та спроби; повідомлення чату та вкладення; OAuth-зв’язки (Google, Telegram); налаштування сповіщень.',
    ),
    p(
      'Дані про уроки містять recurrence (щотижневе повторення), googleMeetUrl, lesson materials (текст, файл, тест). Vocabulary — нормалізований текст слова, переклади WordDefinition за languageId, masteryLevel на картці студента.',
    ),
    p(
      'Вихідні дані: звіти dashboard, inbox чату, статистика profile, PDF/експорт у перспективі; наразі — відображення в UI та JSON через GraphQL.',
    ),
    h2('1.2. Очікуваний результат проєкту'),
    p(
      'Результатом є функціональний веб-застосунок: студент бачить dashboard, календар, vocabulary, practice і чат; викладач керує розкладом і студентами; адміністратор створює акаунти та групові чати. Усі дані зберігаються централізовано в PostgreSQL.',
    ),
    h2('1.3. Аналіз існуючих рішень'),
    p(
      'Порівняно з Duolingo (гейміфікація без живого викладача), Google Classroom (класна модель, не 1:1 словник) та зв’язкою Zoom + Google Sheets (відсутність єдиної БД і RBAC). SoEnglish фокусується на парному навчанні з інтегрованим словником, квізами та календарем Meet.',
    ),
    makeTable(
      ['Рішення', 'Переваги', 'Недоліки для 1:1'],
      [
        ['Duolingo', 'Гейміфікація, мобільність', 'Немає живого викладача та розкладу'],
        ['Google Classroom', 'Завдання, матеріали', 'Слабкий словник і Meet поза системою'],
        ['Zoom + Sheets', 'Простота', 'Розрізнені дані, немає RBAC'],
        ['SoEnglish', 'Уроки + слова + квізи + чат', 'Потребує розгортання інфраструктури'],
      ],
    ),
    p(''),
    h2('1.4. Архітектура рішення'),
    p(
      'Проєкт організовано як npm monorepo (Turborepo): apps/web (Next.js), apps/api (NestJS), packages/backend/modules/* (доменна логіка), packages/shared/types (DTO), data-access-prisma (схема БД). Клієнт звертається до /api через rewrite; GraphQL — /api/graphql; чат — Socket.IO напряму на API :3000.',
    ),
    ...figure(2, 'Шари архітектури monorepo', FIGURES[1][2]),
    h2('1.5. Вибір і обґрунтування засобів та технологій'),
    p(
      'PostgreSQL обрано за надійність і підтримку складних зв’язків. TypeScript забезпечує типобезпеку між клієнтом і сервером. NestJS дає модульну структуру та GraphQL. Next.js — SSR/CSR та App Router. Prisma прискорює роботу зі схемою та міграціями.',
    ),
    p(
      'Модуль оплати (Stripe) заплановано на наступний етап розвитку (див. розділ «План розвитку проєкту»). У поточній реалізації закрито навчальний цикл: від розкладу уроку до закріплення лексики в квізах і спілкування в чаті.',
    ),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section2() {
  const blocks = [
    h1('РОЗДІЛ 2. ВИМОГИ ТА ІНСТРУМЕНТИ ДЛЯ РОБОТИ'),
    h2('2.1. Специфічні вимоги'),
    p(
      'Зацікавлені сторони: студент (навчання), викладач (проведення уроків), адміністратор (облік користувачів), super-admin (CLI-доступ до найвищих прав). Технічна команда використовує репозиторій і LLM Wiki (docs/llm-wiki) як живу документацію продукту.',
    ),
    ...figure(3, 'Діаграма випадків використання', FIGURES[2][2]),
    h3('2.1.1. Функціональні вимоги'),
    p('Таблиця 1. Підсистема «Студент»'),
    makeTable(['ID', 'Функціональність', 'Опис'], FR_STUDENT),
    p(''),
    p('Таблиця 2. Підсистема «Викладач»'),
    makeTable(['ID', 'Функціональність', 'Опис'], FR_TEACHER),
    p(''),
    p('Таблиця 3. Підсистема «Адміністратор»'),
    makeTable(['ID', 'Функціональність', 'Опис'], FR_ADMIN),
    p(''),
    h3('2.1.2. Нефункціональні вимоги'),
    makeTable(['ID', 'Вимога', 'Опис'], NFR),
    p(''),
    h3('2.1.3. Вимоги до зовнішніх інтерфейсів'),
    bullet('REST: /api/auth/* (login, refresh, OAuth callbacks), /api/chat/attachments'),
    bullet('GraphQL: /api/graphql (dashboard, vocabulary, lessons, quizzes, students)'),
    bullet('WebSocket: Socket.IO namespace /chat (message:send, message:new)'),
    bullet('Зовнішні HTTP API: Google OAuth/Calendar, dictionaryapi.dev, MyMemory, SMTP, Telegram'),
    p(''),
    h2('2.2. Технології, засоби та мови програмування'),
    h3('2.2.1. PostgreSQL та Prisma'),
    p(
      `У схемі Prisma визначено моделі: ${PRISMA_MODELS.join('; ')}. Міграції зберігаються в packages/backend/data-access/data-access-prisma/prisma/migrations.`,
    ),
    ...prose(TECH_POSTGRESQL),
    ...prose(TECH_PRISMA),
    h3('2.2.2. Node.js і TypeScript'),
    p(
      'Середовище виконання — Node.js 20+. TypeScript ~5.9 забезпечує статичну типізацію на клієнті та сервері: спільні DTO з packages/shared/types виключають розбіжності контрактів GraphQL і REST.',
    ),
    ...prose(TECH_TYPESCRIPT),
    p(
      'Monorepo керується npm workspaces і Turborepo (паралельний dev/build). Збірка API: tsc + tsc-alias для path aliases @soenglish/*. ESLint 9 (flat config) і Prettier уніфікують стиль коду.',
    ),
    h3('2.2.3. NestJS, GraphQL, Socket.IO'),
    ...prose(TECH_NESTJS),
    ...prose(TECH_GRAPHQL),
    ...prose(TECH_SOCKETIO),
    h3('2.2.4. Next.js і React'),
    ...prose(TECH_NEXTJS),
    ...prose(TECH_REACT),
    ...prose(TECH_ZUSTAND),
    h3('2.2.5. Sass (SCSS)'),
    p(
      'Стилі організовано як CSS Modules (*.module.scss): імена класів унікальні в межах компонента, немає глобальних колізій. Design tokens — CSS custom properties (--green, --text-primary) у globals для темної/світлої теми.',
    ),
    p(
      'SCSS дозволяє вкладеність селекторів і змінні на рівні файлу; поряд із modules для page-specific стилів (dashboard/page.module.scss). lucide-react постачає SVG-іконки як React-компоненти.',
    ),
    h3('2.2.6. Клієнт-серверні технології'),
    ...prose(TECH_JWT_COOKIES),
    p(
      'Next.js rewrite проксує /api на API_PROXY_TARGET для same-origin. Socket.IO потребує NEXT_PUBLIC_SOCKET_URL на хост API (у LAN-розробці — IP машини з API, не localhost клієнта).',
    ),
    p(
      'Клієнт-серверна взаємодія побудована за принципом API-first: клієнт не має прямого доступу до БД; усі операції проходять через NestJS, де застосовуються guards і сервіси видимості (наприклад ChatVisibilityService обмежує, з ким користувач може почати діалог).',
    ),
    p(
      'Для розробки використовується Turborepo: паралельний запуск apps/web (порт 4200) і apps/api (порт 3000). Локально PostgreSQL піднімається через Docker Compose (infra/docker). Змінні середовища документовано в .env.example.',
    ),
    p('Таблиця 4. Зовнішні сервіси'),
    makeTable(['Сервіс', 'Призначення'], SERVICES),
    p(''),
    p('Таблиця 5. Внутрішні пакети monorepo'),
    makeTable(['Шлях', 'Призначення'], WORKSPACE_PACKAGES),
    p(''),
    ...figure(4, 'Структура monorepo в IDE', FIGURES[3][2]),
    h3('2.2.7. Перелік основних npm-залежностей (runtime)'),
    p(`У проєкті використано ${DEPS.length} унікальних npm-пакетів (повний список — Додаток А). Ключові runtime-залежності:`),
    ...DEPS.filter((d) =>
      !d.name.startsWith('@eslint') &&
      !d.name.startsWith('@types') &&
      !['eslint', 'prettier', 'typescript', 'turbo', 'prisma', 'tsx', 'ts-node', 'tsc-alias', 'tsconfig-paths', 'tslib', '@swc'].some((x) => d.name.startsWith(x) || d.name === x),
    )
      .slice(0, 35)
      .map((d) => bullet(`${d.name} ${d.version}`)),
    h2('2.3. Порівняльна характеристика стеку'),
    p(
      'У таблиці узагальнено роль кожної технології в SoEnglish — корисно для усного захисту курсової, коли запитують «навіщо саме цей інструмент».',
    ),
    makeTable(
      ['Технологія', 'Роль у SoEnglish', 'Альтернатива'],
      [
        ['PostgreSQL', 'Персистентність', 'MySQL, MongoDB'],
        ['Prisma', 'ORM + міграції', 'TypeORM, Drizzle'],
        ['NestJS', 'API, DI, guards', 'Express вручну, Fastify'],
        ['GraphQL', 'Доменні запити web', 'REST-only'],
        ['Socket.IO', 'Realtime чат', 'WS raw, Pusher'],
        ['Next.js', 'SSR/CSR, routing', 'Vite SPA, Remix'],
        ['Zustand', 'Client state', 'Redux Toolkit, Jotai'],
        ...STACK_EXTENDED_TABLE,
      ],
    ),
    p(''),
    new Paragraph({ children: [new PageBreak()] }),
  ];
  return blocks;
}

function section3() {
  return [
    h1('РОЗДІЛ 3. РЕАЛІЗАЦІЯ ПРОЕКТУ'),
    h2('3.1. Створення бази даних'),
    h3('3.1.1. Створення таблиць'),
    p('Моделі Prisma відображають сутності предметної області. User має роль і зв’язки з уроками, словником, квізами та чатом.'),
    p(
      'Окремо виділено каталожні уроки (Lesson, Exercise, Progress) — навчальний контент за slug, і операційні ScheduledLesson — реальні заняття 1:1 у календарі. Така відокремленість дозволяє масштабувати контент незалежно від розкладу.',
    ),
    p(
      'Словник Word зберігає нормалізований текст, визначення, приклад, phonetic, synonyms; StudentWordCard додає статус (NEW, REPEATED, MISTAKES_WORK, LEARNED) і поля spaced repetition (nextReviewAt). ReviewQueue підтримує чергу повторень.',
    ),
    ...figure(5, 'ER-діаграма бази даних', FIGURES[4][2]),
    h3('3.1.2. Встановлення зв’язків'),
    p(
      'ScheduledLesson пов’язує teacherId і studentId з User. StudentWordCard — many-to-one до Word. ChatParticipant зв’язує User і ChatConversation. QuizAssignment призначає Quiz студенту.',
    ),
    h3('3.1.3. Нормалізація бази даних'),
    p(
      'Схема відповідає 3NF: довідники (Language, Word) відокремлені від фактів (StudentWordCard, QuizAttempt). Унікальні індекси: email User, normalizedText Word, directKey чату.',
    ),
    ...figure(6, 'Фрагмент schema.prisma', FIGURES[5][2]),
    h2('3.2. Реалізація серверної частини'),
    h3('3.2.1. Конфігурація сервера'),
    p('Точка входу apps/api/src/main.ts:'),
    codeBlock(CODE_MAIN_TS),
    ...figure(7, 'GraphQL Playground / dashboardSummary', FIGURES[6][2]),
    ...figure(8, 'Запуск API (npm run dev)', FIGURES[7][2]),
    h3('3.2.2. Налаштування бази даних'),
    p('PrismaClient інжектується через PrismaModule. DATABASE_URL у .env. Команди: prisma migrate dev, prisma generate.'),
    h3('3.2.3. Маршрутизація та API'),
    p(
      'GraphQL resolvers у apps/api/src/graphql/domain.resolvers.ts (Dashboard, Vocabulary, Lessons, Quizzes, Chat). REST — контролери module-auth, module-chat (upload attachments).',
    ),
    h3('3.2.4. Модулі домену'),
    makeTable(
      ['Модуль', 'Відповідальність'],
      WORKSPACE_PACKAGES.filter((r) => r[0].includes('module')),
    ),
    p(''),
    h3('3.2.5. Realtime-чат'),
    p('ChatGateway (namespace /chat):'),
    codeBlock(CODE_CHAT_GATEWAY),
    h2('3.3. Створення інтерфейсу'),
    h3('3.3.1. Розробка макету'),
    p('UI спирається на макети materials/figma_design; production-компоненти — apps/web/src/components/ui.'),
    h3('3.3.2. Маршрути Next.js'),
    p('Основні сторінки: /dashboard, /calendar, /lessons, /vocabulary, /practice, /quiz, /chat, /students, /admin, /profile, /login.'),
    ...figure(9, 'Сторінка входу', FIGURES[8][2]),
    ...figure(10, 'Dashboard', FIGURES[9][2]),
    ...figure(11, 'Календар', FIGURES[10][2]),
    ...figure(12, 'Vocabulary', FIGURES[11][2]),
    ...figure(13, 'Practice / Quiz', FIGURES[12][2]),
    ...figure(14, 'Чат', FIGURES[13][2]),
    ...figure(15, 'Профіль / Students', FIGURES[14][2]),
    h3('3.3.3. Стилізація SCSS'),
    p('Кожна сторінка має page.module.scss. Спільні токени кольорів і типографіки в globals.'),
    h3('3.3.4. Стан клієнта (Zustand)'),
    p('Stores: dashboard-store, lessons-store, vocabulary-store, chat-store, quizzes-store — завантажують дані через GraphQL та оновлюють UI.'),
    p(
      'Патерн AsyncSlice (idle | loading | success | error) уніфікує відображення спінерів і помилок. Dashboard викликає fetchDashboard(), який паралельно завантажує summary, goals, streak, wordOfDay, lessons і vocabulary для ролі student.',
    ),
    p(
      'Компоненти UI (Button, Field, SurfaceCard, PageHeader) винесено в apps/web/src/components/ui для узгодженого вигляду. Підтвердження небезпечних дій реалізовано через confirmDialog замість window.confirm.',
    ),
    h2('3.4. Підключення клієнтської сторони'),
    p('Rewrite у next.config.mjs:'),
    codeBlock(CODE_NEXT_REWRITE),
    p('graphql-client.ts — запити з credentials: include. chat-socket.ts — io(NEXT_PUBLIC_SOCKET_URL/chat).'),
    ...figure(16, 'DevTools Network', FIGURES[15][2]),
    h2('3.5. Ролі та dashboard'),
    p(
      'Dashboard використовує live GraphQL: dashboardSummary, dailyGoals, learningStreak, wordOfDay, scheduledLessons, studentVocabulary. Hero banner обчислюється клієнтськи (урок → vocab review → practice).',
    ),
    ...figure(21, 'Sidebar за ролями', FIGURES[20][2]),
    h2('3.6. React і Next.js: хуки та організація клієнтського коду'),
    p(
      'Клієнтська частина SoEnglish — React 19 у режимі клієнтських компонентів (use client) для сторінок із мережею та станом. Нижче — хуки React і Next.js, які фактично використовуються в репозиторії apps/web.',
    ),
    h3('3.6.1. Стандартні хуки React'),
    makeTable(['Хук', 'Призначення', 'Приклад у проєкті'], REACT_HOOKS_TABLE),
    p(''),
    p(
      'useState зберігає змінний UI-стан (текст повідомлення, відкриття модалки). useEffect виконує код після рендеру: завантаження даних, підписка на socket.on, cleanup при return () => socket.off. useMemo кешує результат важких фільтрацій (наприклад todayLessons у dashboard). useCallback фіксує функцію між рендерами, щоб не перезапускати effect зайвий раз.',
    ),
    h3('3.6.2. Хуки Next.js App Router'),
    makeTable(['API Next.js', 'Призначення', 'Приклад'], NEXT_HOOKS_TABLE),
    p(''),
    p(
      'App Router розділяє server і client components: layout.tsx може бути серверним, а page.tsx з Zustand — клієнтським. useSearchParams вимагає Suspense boundary на сторінці (див. lessons/page) через асинхронність search params у Next 15+.',
    ),
    h3('3.6.3. Власні хуки проєкту'),
    makeTable(['Хук', 'Призначення', 'Файл'], CUSTOM_HOOKS_TABLE),
    p(''),
    p(
      'Патерн custom hook інкапсулює повторювану логіку: useChatSocket ховає деталі Socket.IO від ChatThread; useProfileLiveStats — агрегацію трьох store для блоку статистики в профілі. Це спрощує тестування та повторне використання.',
    ),
    h3('3.6.4. Теоретичні основи хуків (для захисту)'),
    ...prose(HOOKS_DEFENSE),
    h2('3.7. Детальний опис основного функціоналу'),
    h3('3.7.1. Авторизація та сесії'),
    ...prose(FEATURE_AUTH),
    h3('3.7.2. Уроки та календар'),
    ...prose(FEATURE_LESSONS),
    h3('3.7.3. Словник і practice'),
    ...prose(FEATURE_VOCABULARY),
    p(
      'Practice hub агрегує vocabulary review і quiz; practice-session-tracker надсилає recordPracticeSession для обліку часу. Daily goals і streak мотивують регулярність занять на dashboard.',
    ),
    h3('3.7.4. Квізи'),
    ...prose(FEATURE_QUIZ),
    h3('3.7.5. Чат'),
    ...prose(FEATURE_CHAT),
    h3('3.7.6. Dashboard'),
    ...prose(FEATURE_DASHBOARD),
    h3('3.7.7. Адміністрування'),
    ...prose(FEATURE_ADMIN),
    p(
      'Матриця ролей (roleMatrix у mocks/session) визначає canView(scope, role) на клієнті: student не бачить /students і /admin. На API частина операцій додатково перевіряє teacherId/studentId — важливо знати при захисті про обмеження RBAC.',
    ),
    h3('3.7.8. Маршрути та GraphQL API'),
    p('Таблиця 7. Основні маршрути Next.js App Router'),
    makeTable(['Шлях', 'Доступ', 'Призначення'], ROUTES_TABLE),
    p(''),
    p('Таблиця 8. Ключові операції GraphQL'),
    makeTable(['Операція', 'Тип', 'Призначення'], GRAPHQL_OPS_TABLE),
    p(''),
    h2('3.8. Розгортання та конфігурація'),
    ...prose(DEPLOYMENT_NOTES),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function section4() {
  return [
    h1('РОЗДІЛ 4. ТЕСТУВАННЯ'),
    h2('4.1. Методика тестування'),
    p(
      'Застосовано ручне тестування UI, запити в GraphQL Playground, REST через Postman/Insomnia, перевірку WebSocket у DevTools, статичний аналіз npm run typecheck та lint у monorepo.',
    ),
    p(
      'Для кожної ключової технології перевіряли окремо: GraphQL — валідність схеми та відповіді mutations; Socket.IO — підключення та ack message:send; cookies — збереження після login і передача на /api/graphql; Prisma — цілісність після migrate.',
    ),
    p(
      'Негативні сценарії: login з невірним паролем (401), доступ до /admin під student (прихований UI), відправка чату без conversation:join (повідомлення не доходить), прострочене вкладення чату (410).',
    ),
    h2('4.2. Результати тестування'),
    p('Таблиця 6. Сценарії тестування'),
    makeTable(['ID', 'Сценарій', 'Метод', 'Очікуваний результат'], TEST_SCENARIOS),
    p(''),
    ...figure(17, 'REST login у Postman', FIGURES[16][2]),
    ...figure(18, 'Успішний чат', FIGURES[17][2]),
    ...figure(19, 'Повідомлення про помилку (опційно)', FIGURES[18][2]),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionSources() {
  return [
    h1('СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ'),
    ...SOURCES.map((s, i) => p(`${i + 1}. ${s}`)),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function sectionAppendix() {
  const depRows = DEPS.map((d) => [d.name, d.version, d.packages.slice(0, 2).join(', ')]);
  return [
    h1('ДОДАТКИ'),
    h2('Додаток А. Повний перелік npm-залежностей'),
    makeTable(['Пакет', 'Версія', 'Workspace'], depRows),
    p(''),
    h2('Додаток Б. Змінні середовища (.env.example)'),
    ...fs
      .readFileSync(path.join(ROOT, '.env.example'), 'utf8')
      .split('\n')
      .filter((l) => l && !l.startsWith('#'))
      .slice(0, 25)
      .map((l) => bullet(l)),
    h2('Додаток В. Інструкція запуску'),
    bullet('npm install'),
    bullet('docker compose up -d (PostgreSQL)'),
    bullet('npm run prisma:migrate:dev && npm run prisma:generate'),
    bullet('npm run dev — web :4200, api :3000'),
    bullet('WEB_ORIGIN=http://localhost:4200, NEXT_PUBLIC_SOCKET_URL=http://localhost:3000'),
    ...figure(20, 'Повна ER-діаграма', FIGURES[19][2]),
  ];
}

const PAGE_MARGIN = {
  top: 1134,
  right: 850,
  bottom: 1134,
  left: 1701,
};

function buildDocument() {
  const mainChildren = [
    ...buildTableOfContents(),
    ...sectionIntro(),
    ...sectionRoadmap(),
    ...section1(),
    ...section2(),
    ...section3(),
    ...section4(),
    ...sectionSources(),
    ...sectionAppendix(),
  ];
  return new Document({
    features: {
      updateFields: true,
    },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGIN },
        },
        children: buildTitlePage(),
      },
      {
        properties: {
          page: {
            margin: PAGE_MARGIN,
            pageNumbers: {
              start: 2,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        footers: {
          default: createPageFooter(),
        },
        children: mainChildren,
      },
    ],
  });
}

async function main() {
  const doc = buildDocument();
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, 'Курсова_SoEnglish.docx'), buf);
  console.log('Written:', path.join(OUT_DIR, 'Курсова_SoEnglish.docx'));
  console.log('Markdown: run node scripts/export-coursework-md.mjs');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
