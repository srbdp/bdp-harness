# Architecture

[Replace this with your project's architecture. Keep it concise — this is loaded on-demand when the agent needs system context.]

## System Overview
[2-3 sentence description of the system and its primary purpose.]

## Components
[List the major components/modules and their responsibilities.]

| Component | Responsibility | Key Files |
|-----------|---------------|-----------|
| [Component 1] | [What it does] | `src/...` |
| [Component 2] | [What it does] | `src/...` |

## Data Flow
[Describe how data moves through the system. A text diagram works well:]

```
User → Frontend → API Routes → Service Layer → Database
                                    ↓
                              External APIs
```

## Layer Boundaries

If your project has a `layers.json` at the root, dependency directions are enforced
automatically by `tests/structural/layers.test.ts`. Run the architect agent to
generate an initial config:

    claude -a architect "define layers"

See `layers.json.example` for the format. The structural test will block any import
that crosses a layer boundary in the wrong direction.

## Dependency Rules
[What can depend on what. Keep it simple:]

- UI components depend on services, never the reverse
- Services depend on the database layer, never on UI
- Shared utilities have no dependencies on business logic

## Database
[Brief schema overview or pointer to schema file.]
