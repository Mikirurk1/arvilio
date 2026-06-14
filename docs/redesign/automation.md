# Redesign — автоматичні ітерації агента

Cursor **не запускає** новий чат сам по собі. `./scripts/redesign-loop-tick.sh` у терміналі лише друкує `AGENT_LOOP_WAKE_*` і **наступний ID** — щоб щось реально відбувалось, потрібен **Agent у чаті** (виконати крок + знову tick) або **/loop** з monitored shell (див. нижче).

Щоб не копіювати промпт вручну на кожен крок, є три практичні варіанти.

---

## 1. Скрипт «наступний крок» (рекомендовано)

```bash
./scripts/redesign-next-step.sh
```

Друкує перший рядок плану з `Status: todo` і **готовий промпт** для агента.

Позначити крок виконаним — вручну в `plan.md` (`todo` → `done`) або агент робить це в кінці кроку.

---

## 2. Chain після `done` (рекомендовано зараз)

```bash
./scripts/redesign-next-step.sh   # один крок
# … агент у Composer виконує крок, позначає done …
./scripts/redesign-loop-tick.sh    # друкує наступний ID + wake-рядок
```

Повторюй tick **у тому ж чаті**, попросивши агента виконати наступний крок — або один раз:

```text
Працюй по redesign: ./scripts/redesign-next-step.sh → один ID → done → ./scripts/redesign-loop-tick.sh → повтор, поки немає todo.
```

`REDESIGN_LOOP_MODE=chain ./scripts/redesign-loop.sh` — лише **перший** tick; далі ланцюг тримає агент.

---

## 3. Cursor `/loop` (напівавтомат)

### Shell loop (уже в репо)

```bash
# кожні 10 хв (600s), змінити: REDESIGN_LOOP_INTERVAL_SEC=1800
REDESIGN_LOOP_INTERVAL_SEC=600 ./scripts/redesign-loop.sh
```

Агент отримує `AGENT_LOOP_TICK_REDESIGN` з JSON `prompt`. Зупинка: «зупини redesign loop» або kill процесу.

### У чаті Composer / Agent

```text
/loop 10m
Виконай один крок: ./scripts/redesign-next-step.sh — дотримуйся згенерованого промпту. Лише один ID. Познач done.
```

Або фіксований промпт:

```text
/loop 1h
Прочитай docs/redesign/plan.md. Знайди перший крок з status todo.
Виконай його повністю (soenglish-redesign + redesign-existing-projects skills).
Познач done. Не бери другий крок у тому ж run — лише один ID.
```

**Плюси:** ви один раз увімкнули — агент прокидається кожні N хвилин.  
**Мінуси:** витрата токенів; потрібно сказати «зупини loop», коли достатньо; перевіряйте diff перед commit.

Зупинка: попросіть агента зупинити loop або закрийте background shell.

---

## 4. Один довгий чат «до F0 done»

Один промпт без loop:

```text
Працюй по docs/redesign/plan.md: по одному ID за раз, почни з R-00-01.
Після кожного ID — короткий звіт і чекай мого «далі».
```

Це **не** повна автоматика, але без пошуку наступного ID.

---

## 5. Cursor SDK / CI (майбутнє)

Для повної автоматизації поза IDE — [Cursor SDK](https://cursor.com/docs) або CI job, який викликає agent API з промптом з `redesign-next-step.sh`. Потрібна окрема налаштування і API key.

---

## Чеклист перед loop

1. `npm run dev` + `npm run seed:test-users` (для agent-browser).
2. F0 (`R-00-*`) перед сторінками.
3. Git branch для редизайну; переглядайте diff після кожного tick.
4. Не запускайте два loop одночасно.

---

## Пов’язані файли

- План: [`plan.md`](./plan.md)
- Skill: [`.cursor/skills/soenglish-redesign/SKILL.md`](../../.cursor/skills/soenglish-redesign/SKILL.md)
- Smoke tour: [`scripts/agent-browser-all-pages.sh`](../../scripts/agent-browser-all-pages.sh)
