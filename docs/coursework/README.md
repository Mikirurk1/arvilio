# Курсова робота SoEnglish

## Файли

| Файл | Опис |
|------|------|
| [Курсова_SoEnglish.docx](./Курсова_SoEnglish.docx) | Готовий документ Word (основний здаваний файл) |
| [Курсова_SoEnglish.md](./Курсова_SoEnglish.md) | Текстова версія для редагування |
| [title-meta.json](./title-meta.json) | Титулка: ПІБ, група, викладач |
| [dependencies.json](./dependencies.json) | Автозбір npm-залежностей |
| [coursework-data.mjs](./coursework-data.mjs) | Таблиці FR/NFR, рисунки, фрагменти коду |
| [coursework-expanded.mjs](./coursework-expanded.mjs) | Розширений текст: технології, хуки, функціонал (~50 ст.) |
| [screenshots/README.md](./screenshots/README.md) | Діаграми + які скріншоти зняти вручну |
| [diagrams/README.md](./diagrams/README.md) | Mermaid-джерела рис. 1, 2, 3, 5, 20 |

## Перед здачею

1. Відредагуйте `title-meta.json` (ПІБ, група, викладач).
2. Запустіть `npm run coursework:generate`.
3. Вставте рисунки в Word за маркерами **[ВСТАВИТИ РИС. N]**: діаграми 1, 2, 3, 5, 20 — уже в `screenshots/*.png` (регенерація: `node docs/coursework/diagrams/render-diagrams.mjs`); решта — скріншоти з браузера (див. `screenshots/README.md`).
4. У Word: **правий клік по змісту → Оновити поле → Оновити всю таблицю** (номери сторінок і заголовки).
5. Нумерація сторінок у колонтитулі (зміст починається зі стор. 2; титулка без номера).
6. Перевірте нумерацію рисунків і таблиць.

## Регенерація

```bash
npm run coursework:generate
```

Скрипти:

- `scripts/generate-coursework-docx.mjs` — `.docx`
- `scripts/export-coursework-md.mjs` — `.md`

## Примітка

Текст згенеровано за структурою прикладу DMS і фактичним кодом репозиторію SoEnglish. Скріншоти потрібно зробити локально на `npm run dev`.
