# /pm — Product Manager Agent

Maintains the living project documentation from two source files you write.

## Source files (you write, free format)
- `_roadmap.source.md` — your phases and sub-phases
- `_tasks.source.md` — your identified tasks

## Output files (agent generates) — project root
- `ROADMAP.md` — structured roadmap with statuses
- `TASKS.md` — ordered tasks with sub-tasks and statuses
- `ARCHIVE.md` — completed tasks grouped by month

---

## Commands

### `/pm`
Full sync. Reads git log + both source files. Updates all three output files.

### `/pm done <task name>`
Marks a task as done. Moves it to ARCHIVE.md. Updates `TASKS.md`.
Example: `/pm done email confirmation`

### `/pm work <task name>`
Marks a task as in progress. Updates `TASKS.md`.
Example: `/pm work notifications reminders`

### `/pm status`
Prints a recap in the chat. Does NOT modify any file.

---

## Instructions

---

### `/pm` — Full sync

**Step 1 — Read everything**

Read source files:
- `_roadmap.source.md` (project root)
- `_tasks.source.md` (project root)

Read output files if they exist:
- `ROADMAP.md`
- `TASKS.md`
- `ARCHIVE.md`

Read git log:
```bash
git log --oneline --since="60 days ago" --format="%ad | %s" --date=short
```

**Step 2 — Detect new phases**

Compare phases in source `_roadmap.source.md` against tasks in source `_tasks.source.md`.
If a phase exists in `_roadmap.source.md` but has NO tasks in `_tasks.source.md` yet → generate tasks for that phase only.

When generating tasks for a new phase:
- Read the phase description carefully
- Generate concrete technical tasks (DB, backend, frontend, service, UI layers)
- Apply sub-task breakdown rules (see below)
- Do NOT generate tasks for phases that already have tasks in `_tasks.source.md`

**Step 3 — Infer status from git log**

For each task in `_tasks.source.md`:
- Commit clearly references it → mark ✅ Done, move to archive
- Commit partially addresses it → mark 🔄 In progress
- No commit evidence → keep current status

**Step 4 — Update all three output files**

Write `ROADMAP.md`, `TASKS.md`, `ARCHIVE.md`.

---

### `/pm done <task name>` — Mark task done

1. Find the task in `TASKS.md` by fuzzy matching the name
2. Remove it from `TASKS.md`
3. Append it to `ARCHIVE.md` under the current month section
4. Identify files modified in the last merge to main:
```bash
git diff main~1 main --name-only
```
5. Filter results to `.vue` and `.ts` files under `next-step/src/` and `next-step-api/src/`
6. For each modified file, generate documentation using the /doc logic:
   - Read the file completely
   - Generate the appropriate markdown doc based on file type
   - Write to `docs/front/` or `docs/back/`
7. Confirm in chat:
```
✅ Marked done: <task name> → archived under <Month YYYY>
📄 Documentation updated for X files:
  - docs/front/modules/auth/EmailConfirmation.md
  - docs/back/routes/auth.md
```

---

### `/pm work <task name>` — Mark task in progress

1. Find the task in `TASKS.md` by fuzzy matching the name
2. Move it to the `## 🔄 In progress` section
3. Confirm in chat: `🔄 Now in progress: <task name>`

---

### `/pm status` — Quick recap (chat only, no file changes)

Print in chat:

```
## Next Step — Status

🔄 In progress (X)
- task name
- task name

📋 Todo (X tasks, X high priority)
Next up: <first task from suggested order>

✅ Done this month (X)
- task name
- task name

Last git commit: <date | message>
```

---

## Output file formats

### ROADMAP.md

```markdown
# Next Step — Roadmap

> Last updated: [DATE]

## [Phase name]
**Status:** In progress | Planned | Done

[One paragraph describing what this phase delivers and why it matters]

Progress:
- ✅ Feature done
- 🔄 Feature in progress
- 📋 Feature planned

### Sub-phase [X.Y] — [name]
[description + bullet list]

---
```

### TASKS.md

```markdown
# Next Step — Tasks

> Last updated: [DATE]

---

## 🔄 In progress
- **Task name**
  - 🔄 Sub-task if applicable

---

## 📋 Todo

### 🔴 High priority
- **Task name**
  - 📋 Sub-task 1 — [layer: DB / Backend / Frontend]
  - 📋 Sub-task 2

### 🟡 Normal
- **Task name**

### 🟢 Low priority
- **Task name**

---

## 🗂 Suggested order

1. **Task name** — reason (unblocks X / quick win / no dependencies)
2. **Task name** — reason
...
```

### ARCHIVE.md

```markdown
# Next Step — Archive

> Completed tasks, grouped by month.

---

## March 2026
- ✅ Task name — completed [DATE]
- ✅ Task name — completed [DATE]

## February 2026
- ✅ Task name
...
```

---

## Sub-task breakdown rules

Break a task into sub-tasks when ANY of these is true:
- Touches more than one layer (DB + backend + frontend)
- Has sequential dependencies (step A must be done before step B)
- Too vague to know where to start

Sub-task format:
```
- **Settings: reminder timing**
  - 📋 DB: add `reminder_timing` field (Knex migration)
  - 📋 Backend: GET/PUT `/api/settings/reminders`
  - 📋 Service: `getReminderSettings()` / `updateReminderSettings()`
  - 📋 UI: multi-select in Settings page
  - 📋 Scheduler: read timing and trigger reminders
```

Do NOT break down atomic tasks (single file, single clear action).

---

## Task ordering rules

Order tasks in `TASKS.md` and in Suggested order by these principles:

1. **Unblock first** — tasks other tasks depend on go first
2. **Foundation before features** — DB → backend → service → UI
3. **Quick wins early** — atomic tasks with no dependencies, completable in < 1h
4. **Group by module** — batch tasks in the same module together
5. **Risk last** — uncertain or experimental tasks go at the end

Always include a one-line reason for each position in Suggested order.

---

## Rules
- Source files are truth — never modify `_roadmap.source.md` or `_tasks.source.md`
- Output files (`ROADMAP.md`, `TASKS.md`, `ARCHIVE.md`) at project root are fully rewritten on each `/pm` run
- Only generate tasks for NEW phases not yet represented in `_tasks.source.md`
- Infer status from git log only when there is clear evidence — never guess
- `/pm status` never writes files — chat output only
- Archive entries include the completion date
- Always update "Last updated" date in all output files
- /pm done always runs doc generation on merge-modified files — never skip it