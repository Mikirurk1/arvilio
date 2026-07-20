#!/usr/bin/env node
/** Exports docs/coursework/Курсова_Arvilio.md from coursework-data.mjs */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { CODE_APPENDIX, CODE_APPENDIX_INTRO } from '../docs/coursework/coursework-code-appendix.mjs';
import {
  REACT_HOOKS_TABLE,
  NEXT_HOOKS_TABLE,
  CUSTOM_HOOKS_TABLE,
  TECH_POSTGRESQL,
  TECH_NESTJS,
  TECH_GRAPHQL,
  FEATURE_AUTH,
  FEATURE_VOCABULARY,
  FEATURE_CHAT,
} from '../docs/coursework/coursework-expanded.mjs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../docs/coursework');
const META = JSON.parse(fs.readFileSync(path.join(OUT, 'title-meta.json'), 'utf8'));
const DEPS = JSON.parse(fs.readFileSync(path.join(OUT, 'dependencies.json'), 'utf8'));

function tableMd(headers, rows) {
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const head = `| ${headers.join(' | ')} |`;
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}\n`;
}

function fig(n) {
  const f = FIGURES.find((x) => x[0] === n);
  return `\n> **[ВСТАВИТИ РИС. ${n}]** ${f[1]}. *${f[2]}*\n\n*Рис. ${n}. ${f[1]}*\n`;
}

const md = `# Курсова робота: ${META.topic}

${META.ministry}  
**${META.university}**  
${META.institute}  
${META.department}

**Дисципліна:** ${META.discipline}  
**Виконав(ла):** ${META.authors.join(', ')}, гр. ${META.group}  
**Керівник:** ${META.supervisor}  
**${META.city}, ${META.year}**

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

Курсова робота присвячена проектуванню та практичній реалізації веб-платформи **Arvilio** для дистанційного навчання англійської мови. Система охоплює індивідуальні уроки 1:1 з інтеграцією Google Meet, персональний словник із spaced repetition, генерацію та проходження квізів, календар занять, dashboard зі streak і daily goals, а також realtime-чат між учасниками навчального процесу.

Рівень зберігання даних реалізовано на **PostgreSQL** із ORM **Prisma**. Серверна частина побудована на **NestJS** (REST + GraphQL + Socket.IO), клієнтська — на **Next.js 16** та **React 19**.

---

## ВСТУП

Володіння англійською мовою є критичним фактором професійного та академічного успіху. Метою проєкту Arvilio є створення єдиного веб-застосунку, який об’єднує розклад уроків, словникову роботу, практику, оцінювання через квізи та комунікацію в чаті.

${fig(1)}

---

## ШЛЯХИ ПОКРАЩЕННЯ ТА ПЛАН РОЗВИТКУ ПРОЄКТУ

${tableMd(['Етап', 'Напрям', 'Зміст робіт'], DEVELOPMENT_PLAN)}

### Шляхи технічного покращення

${IMPROVEMENT_PATHS.map((t) => `- ${t}`).join('\n')}

## РОЗШИРЕННЯ ФУНКЦІОНАЛУ

${tableMd(['Напрям', 'Опис'], FUNCTIONAL_EXPANSION)}

## ПЕРСПЕКТИВИ ВИКОРИСТАННЯ

${USAGE_PERSPECTIVES.map((t) => `- ${t}`).join('\n')}

---

## РОЗДІЛ 1. ПОСТАНОВКА ЗАВДАННЯ

### 1.1. Вхідні дані

Облікові записи користувачів, заплановані уроки, словник, квізи, чат, OAuth, сповіщення.

### 1.2. Очікуваний результат

Єдиний веб-кабінет для student / teacher / admin з централізованою БД.

### 1.3. Аналіз існуючих рішень

${tableMd(['Рішення', 'Переваги', 'Недоліки'], [
  ['Duolingo', 'Гейміфікація', 'Немає 1:1 викладача'],
  ['Google Classroom', 'Матеріали', 'Слабкий словник'],
  ['Arvilio', 'Уроки+слова+квізи+чат', 'Потрібне розгортання'],
])}

### 1.4. Архітектура

Monorepo: apps/campus, apps/api, packages/backend/modules/*, Prisma.

${fig(2)}

### 1.5. Обґрунтування технологій

PostgreSQL, TypeScript, NestJS, Next.js, Prisma, GraphQL.

---

## РОЗДІЛ 2. ВИМОГИ ТА ІНСТРУМЕНТИ

${fig(3)}

### 2.1.1. Функціональні вимоги — Студент

${tableMd(['ID', 'Функціональність', 'Опис'], FR_STUDENT)}

### Викладач

${tableMd(['ID', 'Функціональність', 'Опис'], FR_TEACHER)}

### Адміністратор

${tableMd(['ID', 'Функціональність', 'Опис'], FR_ADMIN)}

### 2.1.2. Нефункціональні

${tableMd(['ID', 'Вимога', 'Опис'], NFR)}

### 2.1.3. Зовнішні інтерфейси

REST /api/auth, GraphQL /api/graphql, Socket.IO /chat, Google APIs, dictionary API, SMTP, Telegram.

### 2.2. Технології

Моделі Prisma: ${PRISMA_MODELS.join('; ')}.

${tableMd(['Сервіс', 'Призначення'], SERVICES)}

${tableMd(['Пакет', 'Призначення'], WORKSPACE_PACKAGES)}

${fig(4)}

### npm-залежності (${DEPS.length} пакетів)

Повний перелік — Додаток А у DOCX.

### 2.2.1–2.2.4 (детально в DOCX)

${TECH_POSTGRESQL.map((t) => t).join('\n\n')}

${TECH_NESTJS.join('\n\n')}

${TECH_GRAPHQL.join('\n\n')}

### 2.3. Порівняльна таблиця стеку

| Технологія | Роль | Альтернатива |
| PostgreSQL | Персистентність | MySQL |
| NestJS | API | Express |
| GraphQL | Запити web | REST |
| Next.js | UI routing | Vite SPA |

---

## РОЗДІЛ 3. РЕАЛІЗАЦІЯ

${fig(5)}
${fig(6)}

### 3.2. Сервер (main.ts)

\`\`\`typescript
${CODE_MAIN_TS}
\`\`\`

${fig(7)}
${fig(8)}

### Chat gateway

\`\`\`typescript
${CODE_CHAT_GATEWAY}
\`\`\`

### 3.3. Клієнт

${fig(9)}
${fig(10)}
${fig(11)}
${fig(12)}
${fig(13)}
${fig(14)}
${fig(15)}

### 3.4. Інтеграція

\`\`\`javascript
${CODE_NEXT_REWRITE}
\`\`\`

${fig(16)}
${fig(21)}

### 3.6. React / Next.js — хуки

${tableMd(['Хук', 'Призначення', 'Приклад'], REACT_HOOKS_TABLE)}

${tableMd(['Next.js', 'Призначення', 'Приклад'], NEXT_HOOKS_TABLE)}

${tableMd(['Custom hook', 'Призначення', 'Файл'], CUSTOM_HOOKS_TABLE)}

### 3.7. Основний функціонал

${FEATURE_AUTH.join('\n\n')}

${FEATURE_VOCABULARY.join('\n\n')}

${FEATURE_CHAT.join('\n\n')}

*Повний опис усіх модулів (уроки, квізи, dashboard, admin) — у DOCX, розділ 3.7.*

---

## РОЗДІЛ 4. ТЕСТУВАННЯ

${tableMd(['ID', 'Сценарій', 'Метод', 'Результат'], TEST_SCENARIOS)}

${fig(17)}
${fig(18)}
${fig(19)}

---

## СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ

${SOURCES.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

## ДОДАТКИ

### Додаток А — npm (${DEPS.length})

${tableMd(['Пакет', 'Версія', 'Workspace'], DEPS.map((d) => [d.name, d.version, d.packages.join(', ')]))}

${fig(20)}

### Додаток Г — фрагменти коду (${CODE_APPENDIX.length} розділів)

${CODE_APPENDIX_INTRO}

${CODE_APPENDIX.map(
  (e) => `#### ${e.id}. ${e.title}

*Файл:* \`${e.file}\`

${e.description}

\`\`\`typescript
${e.code}
\`\`\`
`,
).join('\n')}
`;

fs.writeFileSync(path.join(OUT, 'Курсова_Arvilio.md'), md, 'utf8');
console.log('Written:', path.join(OUT, 'Курсова_Arvilio.md'));
