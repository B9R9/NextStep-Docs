# /doc — Documentation Agent

Generate documentation for a file or module and push it to NextStep-Docs.

## Usage

```
/doc                          # Document the current file
/doc src/modules/applications/views/ApplicationsMainView.vue
/doc src/modules/applications/store/useApplicationsStore.ts
```

## What this agent does

1. Read the target file completely
2. Identify the file type (page/view, component, store, service, composable, types)
3. Generate a detailed markdown documentation page
4. Write the doc to the correct path in `../NextStep-Docs/docs/front/`
5. Report what was written and what to review

---

## Instructions

Read the target file provided by the user (or the current open file if none specified).

Identify the file type based on its path:
- `/views/` or `/pages/` → Vue page/view
- `/components/` → Vue component
- `/store/` or `/stores/` → Pinia store
- `/services/` → Axios service
- `/composables/` → Vue composable
- `/types/` or `*.types.ts` → TypeScript types

Then generate the documentation following the template below for that file type.

---

## Documentation templates

### Vue page/view

```markdown
# FileName

One-sentence summary of what this page shows and its role in the app.

## What this page does
- [Every feature as a bullet: what it renders, what interactions it handles, what side effects it triggers]

## Local state
| Name | Type | Description |
|------|------|-------------|
| `ref` | `type` | what it holds |

## Computed
| Name | Derives from | Description |
|------|-------------|-------------|

## Key behaviors
[Explain non-obvious logic in detail: debounce timing, filter algorithm, sort logic, URL query param sync, dialog flow, toast/feedback system, etc.]

## Dependencies
- **Stores**: list real store names used
- **Components**: list all imported components
- **Utils**: list utility functions used
- **i18n keys**: list key prefixes found (e.g. `applications.status.*`, `applications.columns.*`)
- **Router**: query params or route params used
```

### Vue component

```markdown
# ComponentName

One-sentence summary of what this component renders and its purpose.

## Props
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|

## Emits
| Event | Payload | When |
|-------|---------|------|

## What it renders
[Describe the visual output and all interactive behaviors]

## Internal logic
[Non-trivial computed, watchers, or methods worth explaining]

## Usage
\`\`\`vue
<ComponentName :prop="value" @event="handler" />
\`\`\`

## Dependencies
- Child components, stores accessed, i18n keys used
```

### Pinia store

```markdown
# useStoreName

One-sentence summary of what state this store manages.

## State
| Name | Type | Description |
|------|------|-------------|

## Getters
| Name | Returns | Description |
|------|---------|-------------|

## Actions
### actionName(params)
What it does step by step, which API endpoint it calls (METHOD /route),
which state it mutates, which errors it handles.

## Usage
\`\`\`typescript
const store = useStoreName()
store.actionName(params)
\`\`\`

## Dependencies
- Services called, other stores used
```

### Axios service

```markdown
# service.name

One-sentence summary of which API resource this service handles.

## Endpoints
### functionName(params)
- **Method**: GET/POST/PUT/DELETE
- **Route**: /api/resource/:id
- **Payload**: `{ field: type }`
- **Response**: `{ field: type }`
- **Errors**: what errors are caught

## Usage
\`\`\`typescript
const result = await serviceName.functionName(params)
\`\`\`

## Dependencies
- Base URL, auth headers used
```

### Vue composable

```markdown
# useComposableName

One-sentence summary of what logic this encapsulates.

## Parameters
| Name | Type | Description |
|------|------|-------------|

## Returns
| Name | Type | Description |
|------|------|-------------|

## How it works
[Internal logic, side effects, lifecycle hooks, watchers]

## Usage
\`\`\`typescript
const { value, method } = useComposableName(params)
\`\`\`

## Dependencies
- Other composables, stores, services used
```

### TypeScript types

```markdown
# types

One-sentence summary of what domain these types represent.

## Types and Interfaces
### TypeName
Purpose of this type.
| Field | Type | Description |
|-------|------|-------------|

## Unions and Enums
### UnionName
| Value | Meaning |
|-------|---------|

## Usage
Where these types are imported and used in the codebase.
```

---

## Output rules

- Every detail must come from the actual code — never invent props, actions, routes, or keys
- Use real variable names, real i18n key prefixes, real TypeScript type names from the code
- No vague descriptions like "manages state" or "handles operations" — be specific
- After generating, write the file to `../NextStep-Docs/docs/front/[module]/[FileName].md`
- Confirm the file was written and show the first 20 lines as a preview
