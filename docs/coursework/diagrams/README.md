# Діаграми для курсової (Рис. 1, 2, 3, 4, 5, 20)

Джерела — файли `.mmd` (Mermaid). PNG для Word — у `../screenshots/`.

## Згенерувати PNG

```bash
node docs/coursework/diagrams/render-diagrams.mjs
```

Потрібні: Node.js, мережа (перший запуск підтягує `@mermaid-js/mermaid-cli`).

Експорт: **scale 3**, ширина 2000–3200 px, `deviceScaleFactor: 2`, яскрава тема в `mermaid-config.json` — зручно для Word і друку.

## Відповідність рисункам

| Рис. | Файл PNG | Джерело `.mmd` |
|------|----------|----------------|
| 1 | `screenshots/01-architecture.png` | `01-architecture.mmd` |
| 2 | `screenshots/02-layers.png` | `02-layers.mmd` |
| 3 | `screenshots/03-use-case.png` | `03-use-case.mmd` |
| 4 | `screenshots/04-monorepo-tree.png` | `04-monorepo-tree.mmd` |
| 5 | `screenshots/05-erd.png` | `05-erd-core.mmd` |
| 20 | `screenshots/20-erd-full.png` | `20-erd-full.mmd` |

Рис. 6–19, 21 — **скріншоти** з робочого застосунку (див. `screenshots/README.md`), не генеруються з Mermaid.

## Редагування

Відкрийте `.mmd` у VS Code (розширення Mermaid) або [mermaid.live](https://mermaid.live), змініть текст, знову запустіть `render-diagrams.mjs`.
