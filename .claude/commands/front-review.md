# /front-review — Frontend Review Agent

Review all modified files in the current PR or branch against main.

## Usage

```
/front-review                        # Review all modified files vs main
/front-review src/modules/applications/views/ApplicationsMainView.vue
```

## What this agent does

1. Run `git diff main --name-only` to get all modified frontend files
2. For each `.vue` and `.ts` file, read the full content
3. Review each file across all dimensions below
4. Output a structured report grouped by file, then by severity

---

## Instructions

First, run:
```bash
git diff main --name-only
```

Filter results to only `.vue` and `.ts` files under `next-step/src/`.
If the user provided a specific file path, review only that file.

Read each file completely before reviewing it.
Then apply every check below. Only report real issues found in the actual code — never invent problems.

---

## Review checklist

### Vue & Pinia conventions
- [ ] `<script setup lang="ts">` used (not Options API, not missing lang)
- [ ] Props defined with `defineProps<{}>()` using TypeScript interface, not runtime declaration
- [ ] Emits defined with `defineEmits<{}>()` using TypeScript interface
- [ ] No direct store state mutation outside of store actions (e.g. `store.rows = []` in a component)
- [ ] Computed properties used for derived state, not methods called in template
- [ ] No logic inside template expressions beyond simple ternaries
- [ ] `v-for` always has `:key` with a unique stable value (not index unless list is static)
- [ ] `v-if` and `v-for` never on the same element
- [ ] Watchers have `immediate: true` only when needed, not as a default
- [ ] No `watch` used where a `computed` would suffice

### TypeScript
- [ ] No `any` type (flag every occurrence with line number)
- [ ] No non-null assertions `!` without a comment explaining why it's safe
- [ ] No `as Type` casting without justification
- [ ] All function parameters and return types are explicitly typed
- [ ] No `@ts-ignore` or `@ts-expect-error` without explanation

### Performance
- [ ] No expensive operations inside computed without memoization awareness
- [ ] Event listeners cleaned up in `onUnmounted` if added manually
- [ ] No `console.log` or debug statements left in code
- [ ] Large lists use virtual scrolling or pagination (flag if > 100 items rendered at once)

### Security
- [ ] No sensitive data (tokens, passwords, personal data) logged to console
- [ ] Auth token accessed only via `localStorage.getItem('auth_token')`, not hardcoded
- [ ] No `v-html` used with user-supplied content (XSS risk)
- [ ] API errors don't expose stack traces or internal details to the UI

### i18n
- [ ] No hardcoded user-visible strings in template or script (must use `t('key')`)
- [ ] i18n keys follow pattern `module.section.key`
- [ ] No concatenated translated strings (use interpolation: `t('key', { value })`)
- [ ] `useI18n()` imported when `t()` is used

### Accessibility
- [ ] Interactive elements are `<button>` or `<a>`, not `<div @click>`
- [ ] Buttons have visible label or `aria-label`
- [ ] Form inputs have associated `<label>` or `aria-label`
- [ ] Images have `alt` attribute
- [ ] Dynamic content updates use `aria-live` where appropriate

### Code quality
- [ ] No duplicated logic that could be extracted to a composable or utility
- [ ] Functions do one thing (flag functions > 30 lines)
- [ ] No dead code (unused imports, variables, functions)
- [ ] Error states handled (not just happy path)
- [ ] Loading states handled where async operations occur

---

## Output format

For each file, output:

```
## path/to/FileName.vue

### Critical
- [line X] Description of the issue and why it matters + suggested fix

### Warning  
- [line X] Description of the issue + suggested fix

### Info
- [line X] Minor suggestion or improvement

### OK
- List of dimensions that passed with no issues
```

Severity levels:
- **Critical** — security risk, TypeScript `any`, broken functionality, XSS, auth issues
- **Warning** — convention violation, performance issue, missing i18n, accessibility gap
- **Info** — code quality suggestion, minor refactor opportunity

At the end, output a summary:

```
## Summary
- X files reviewed
- X critical issues
- X warnings  
- X info

### Files with critical issues
- list them

### Quick wins (info-level, easy to fix)
- list them
```

---

## Rules
- Only report issues found in the actual code — never invent problems
- Always include the line number when flagging an issue
- For each issue, explain WHY it is a problem, not just what it is
- If a file has no issues, say so explicitly — do not skip it