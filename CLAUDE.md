# CLAUDE.md

## Project Overview
[2-3 sentences: what this project is, who it's for, what it optimizes for.]

## Tech Stack
- [Framework: e.g., Next.js 15, FastAPI, etc.]
- [Database: e.g., Supabase Postgres, SQLite, etc.]
- [Deployment: e.g., Vercel, Railway, etc.]
- [Key libraries: e.g., shadcn/ui, Tailwind, Zod, etc.]

## Architecture
[Brief description of system components and data flow.]
Full architecture: `docs/ARCHITECTURE.md`
Design decisions and constraints: `docs/DESIGN_DECISIONS.md`

## Key Design Decisions
- [Non-obvious constraint #1 and why]
- [Non-obvious constraint #2 and why]
- [Non-obvious constraint #3 and why]

## Repository Map

### Source Documents
- `inputs/` — PRD, specs, and source documents that drive development. Add your PRD here first.
- `docs/specs/` — Product specifications and acceptance criteria. Break the PRD into buildable specs.
- `docs/references/` — External reference materials (llms.txt files, API docs, library docs). Drop anything the agent should be able to look up.

### Architecture & Decisions
- `docs/ARCHITECTURE.md` — System design and component map. Read before making structural changes; update when the architecture evolves.
- `docs/DESIGN_DECISIONS.md` — Non-obvious constraints and rationale. Update when you make a surprising or non-obvious choice.
- `layers.json` — Machine-enforced layer boundaries. Defines which layers can depend on which. Enforced by `tests/structural/layers.test.ts`. Generate with `claude -a architect "define layers"` or copy from `layers.json.example`.

### Quality & Learning
- `docs/QUALITY_SCORECARD.md` — Quality grades by domain (test coverage, type safety, etc.). Review periodically; target weak areas with `/improve`.
- `docs/LEARNINGS.md` — Problem/fix log. When you engineer a solution to a failure (hook, rule, test), log it here so it compounds.
- `docs/TECH_DEBT.md` — Explicit tech debt tracker. Log debt when you create it; resolve entries when you fix it.

### Planning
- `docs/plans/TEMPLATE.md` — Template for execution plans.
- `docs/plans/active/` — Plans currently being executed. For complex features, create a plan here before coding.
- `docs/plans/completed/` — Finished plans. Move here when done.

### Code & Tests
- `tests/unit/` — Unit tests, co-located pattern: `feature.ts` → `feature.test.ts`
- `tests/e2e/` — End-to-end tests
- `tests/fixtures/` — Shared test data
- `tests/structural/` — Architecture boundary tests (auto-enforces `layers.json` when present)

### Harness Configuration
- `.claude/settings.json` — Hooks (format, typecheck, git safety)
- `.claude/rules/` — Path-scoped rules (workflow, testing, git safety, frontend, API)
- `.claude/skills/improve/` — Closed-loop optimization skill
- `.claude/agents/security-reviewer.md` — Security-focused code review agent
- `.claude/agents/doc-gardener.md` — Documentation staleness auditor (invoke: `claude -a doc-gardener`)
- `.claude/agents/architect.md` — Layer boundary analyzer (invoke: `claude -a architect "define layers"`)

## Available Tools

### Built-in Skills
- `/simplify` — Code quality review (reuse, clarity, efficiency)
- `/pr-review-toolkit:review-pr` — Comprehensive pre-merge PR review

### Custom Skills
- `/improve` — Closed-loop optimization. Give it a mechanical metric (e.g., "increase test coverage from 72% to 90%") and it iterates autonomously. See `.claude/skills/improve/references/` for protocol details.

### Agents
- `security-reviewer` — Security-focused code review. Runs automatically or on demand.
- `doc-gardener` — Documentation staleness auditor. Runs on demand.
- `architect` — Analyzes codebase and generates/validates `layers.json` for boundary enforcement.
- Agent teams — For larger tasks, spawn a team where each builder gets its own worktree.

## Working with Plans
For complex features or multi-step work:
1. Copy `docs/plans/TEMPLATE.md` → `docs/plans/active/<name>.md`
2. Fill in the goal, context, approach, and task list
3. Execute the plan, logging decisions as you go
4. When complete, fill in the Outcome section and move to `docs/plans/completed/`

## Development Rules
- Simplicity first — complexity adds bug vectors
- Test before code — write tests BEFORE implementation
- One change at a time — atomic, bisectable commits
- Verify everything — if a machine can check it, don't rely on judgment

## Mandatory Code Change Workflow
**EVERY code change MUST follow these steps. No exceptions.**
1. Create a worktree — never modify main directly
2. Write failing tests first
3. Implement until tests pass
4. Run `/simplify` — code quality review
5. Run `/pr-review-toolkit:review-pr` — pre-merge validation
6. Merge to main after reviews pass
7. Clean up the worktree

## Commands
- `npm run dev` — start dev server
- `npm run test` — run unit tests
- `npm run build` — production build
- `npm run lint` — lint check
- `npm run typecheck` — type check

## Compaction Instructions
When compacting, always preserve: the current task objective, all modified file paths, test commands and their results, architectural constraints from this file, and any unresolved errors. Before compaction, write current progress and state to `docs/plans/active/` so it survives context window resets.
