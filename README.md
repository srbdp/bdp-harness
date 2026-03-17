# bdp-harness

## Why this exists

Claude Code is powerful out of the box, but without structure it drifts — it forgets conventions, skips tests, introduces dependencies you didn't ask for, and slowly accumulates entropy. The more autonomy you give it, the faster things go sideways.

A **harness** is the set of files in your repo that constrain and guide the agent: what it knows about your project, what it's allowed to do, and what gets checked automatically. Think of it like guardrails on a highway — they don't slow you down, they let you go faster because you're not worried about going off a cliff.

This template gives you a production-ready harness in ~15 minutes. Instead of discovering these patterns through trial and error over weeks, you clone this repo and get:

- **Hooks** that enforce quality automatically (formatting, type checking, lint, secrets protection) — the agent literally cannot skip them
- **Rules** that inject the right context at the right time — frontend conventions only load when you touch UI files
- **A mandatory workflow** (worktree → test → implement → review → merge) that prevents the agent from making sloppy, unreviewable changes directly on main
- **Living documentation** that the agent reads before every task and updates as it works — so it gets smarter over time instead of repeating mistakes

**You should use this if:** You're building a real project with Claude Code and want it to produce consistent, reviewable, production-quality work without constant hand-holding.

**You probably don't need this if:** You're just experimenting, doing one-off scripts, or prefer to build your own harness from scratch.

## What's in the box

Clone this template, customize `CLAUDE.md` for your project, and start building. The harness gives you:

- **CLAUDE.md** — A project constitution that tells the agent how to think about your codebase
- **Rules** — Conditional context that loads only when relevant files are touched
- **Hooks** — Deterministic enforcement (auto-formatting, type checking, git safety) that can't be bypassed
- **Worktree workflow** — Every change happens in isolation, reviewed before merging to main
- **`/improve` skill** — Closed-loop optimization inspired by Karpathy's autoresearch
- **Quality tracking** — Scorecard and learnings log to manage entropy over time

## Setup Guide

### 1. Clone and reinitialize git

Start with a clean history so your project isn't tied to the template's commits.

```bash
git clone https://github.com/you/bdp-harness my-project
cd my-project
rm -rf .git && git init && git add -A && git commit -m "init: bdp-harness template"
```

### 2. Run the setup validator

```bash
bash init.sh
```

This checks your environment (Node.js, git, Claude CLI) and project setup. Fix any FAIL items before proceeding; TODO items can wait.

### 3. Fill in CLAUDE.md

This is the agent's constitution — it reads this file before every task. Open `CLAUDE.md` and fill in:

- **Project Overview** — What you're building, in 2-3 sentences
- **Tech Stack** — Framework, database, deployment target, key libraries
- **Architecture** — Brief component/data-flow summary
- **Key Design Decisions** — Non-obvious constraints the agent needs to respect
- **Commands** — Update `npm run` commands to match your actual scripts

### 4. Add your PRD and specs to `inputs/`

The agent reads `inputs/` to understand what to build. Drop in your PRD, product specs, or design briefs. For structured specs with acceptance criteria, use `docs/specs/`.

### 5. Write your architecture in `docs/ARCHITECTURE.md`

The agent reads this before making structural changes. Document your system components, data flow, and key boundaries. Even a rough sketch helps — the agent will respect whatever constraints you document.

### 6. Customize rules for your stack

Rules in `.claude/rules/` load automatically when matching files are touched. The defaults cover workflow, testing, git safety, frontend, and API patterns. Review and update them:

- `frontend.md` — UI conventions (component library, styling approach)
- `api.md` — API patterns (validation, error handling, auth)
- `testing.md` — Test conventions (mocking strategy, coverage targets)
- `workflow.md` and `git-safety.md` — Generally don't need changes

### 7. Verify hooks work

Run a quick sanity check to make sure the enforcement hooks are active:

```bash
claude -p "Run npm run typecheck and npm run lint. Report results."
```

If either command isn't set up yet, configure your `package.json` scripts first.

### 8. Start Claude Code

```bash
claude
```

The agent will read `CLAUDE.md`, pick up the rules, and follow the mandatory workflow.

## Your First Feature

To see the harness in action, try this sequence:

1. **Give the agent a task** — e.g., "Add a health check endpoint at GET /api/health that returns { status: 'ok' }"
2. **Watch the workflow** — The agent will create a worktree, write tests first, implement, then run `/simplify` and `/pr-review-toolkit:review-pr` before merging.
3. **Check the result** — You'll have an isolated commit on main with tests, reviewed code, and a clean worktree.

This is the pattern for every code change: worktree → test → implement → review → merge → cleanup.

## What's Included

### Project Root
| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project constitution — the agent's map to your repo |
| `.prettierrc` | Code formatting config (enforced by hooks) |
| `.gitignore` | Standard ignores for Node.js projects |
| `init.sh` | Setup validator — checks environment and project configuration |

### `.claude/` — Harness Configuration
| File | Purpose |
|------|---------|
| `settings.json` | Hooks — format on save, typecheck on commit, git safety blocks |
| `rules/workflow.md` | Mandatory worktree → test → implement → review → merge sequence |
| `rules/testing.md` | Test-first development conventions |
| `rules/git-safety.md` | Blocks force push, reset --hard, and other destructive operations |
| `rules/frontend.md` | UI/component conventions (customize for your stack) |
| `rules/api.md` | API patterns — validation, error handling, auth (customize for your stack) |
| `rules/secrets.md` | Secrets management — never hardcode keys, use .env pattern |
| `rules/error-handling.md` | Error handling conventions — try/catch, typed errors, fail fast |
| `rules/dependencies.md` | Dependency management — audit before installing, prefer built-ins |
| `skills/improve/` | Closed-loop optimization skill with protocol and metrics references |
| `agents/security-reviewer.md` | Security-focused code review subagent |
| `agents/doc-gardener.md` | Documentation staleness auditor (run: `claude -a doc-gardener`) |

### `docs/` — Living Documentation
| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | System design — agent reads this before structural changes |
| `DESIGN_DECISIONS.md` | Non-obvious constraints — agent reads this to avoid surprises |
| `QUALITY_SCORECARD.md` | Quality grades by domain — run `/improve` against weak areas |
| `LEARNINGS.md` | Problem/fix log — every failure becomes a permanent fix |
| `plans/TEMPLATE.md` | Execution plan template for complex features |
| `plans/active/` | Plans currently being executed |
| `plans/completed/` | Finished plans (archive) |
| `specs/` | Product specifications and acceptance criteria |
| `references/` | External references (llms.txt, API docs, library docs) |
| `TECH_DEBT.md` | Explicit tech debt tracker with effort/priority ratings |

### `inputs/` — Source Documents
Your PRD, product specs, and design briefs. The agent reads these to understand what to build.

### `tests/` — Test Directories
| Directory | Purpose |
|-----------|---------|
| `unit/` | Unit tests (co-located: `feature.ts` → `feature.test.ts`) |
| `e2e/` | End-to-end tests |
| `fixtures/` | Shared test data and mocks |
| `structural/` | Architecture boundary tests (`.template.ts` → `.test.ts` to activate) |

### `.github/` — GitHub Configuration
| File | Purpose |
|------|---------|
| `workflows/ci.yml` | GitHub Actions CI pipeline (customize for your stack) |
| `PULL_REQUEST_TEMPLATE.md` | PR template — what/why/how, testing checklist, security checklist |

## The Mandatory Workflow

Every code change follows this sequence:

1. **Worktree** — Create an isolated branch (`git worktree add`)
2. **Test first** — Write failing tests that define "done"
3. **Implement** — Build until tests pass
4. **`/simplify`** — Code quality review (built-in)
5. **`/pr-review-toolkit:review-pr`** — Comprehensive PR review (built-in)
6. **Merge** — Only after reviews pass
7. **Cleanup** — Remove the worktree

## The `/improve` Skill

Define a mechanical metric, then let the agent iterate autonomously:

```
/improve increase test coverage from 72% to 90%
```

The agent will:
- Establish a baseline measurement
- Make one atomic change per iteration
- Commit before verifying (git is the undo mechanism)
- Keep improvements, revert regressions
- Log everything in `results.tsv`

See `.claude/skills/improve/references/` for the full protocol and metrics guide.

## Philosophy

1. **Repo is the system of record.** If it's not in the repo, the agent can't see it.
2. **Verification beats instruction.** Hooks enforce; CLAUDE.md advises.
3. **Engineer solutions for every failure, once.** Log it in `docs/LEARNINGS.md`.
4. **Constraint enables autonomy.** Scope + metric + guard = effective agent.
5. **Context is finite.** Keep CLAUDE.md under 150 lines. Less is more.

## Customizing

- **Add rules** in `.claude/rules/` — unconditional (always loaded) or path-scoped (loaded when matching files are touched)
- **Add hooks** in `.claude/settings.json` — format, lint, block operations
- **Add subagents** in `.claude/agents/` — specialized reviewers for your domain
- **Audit docs** with `claude -a doc-gardener "audit all docs"` — finds stale paths, outdated commands, broken references
- **Add skills** in `.claude/skills/` — multi-step workflows for recurring tasks
- **Track quality** in `docs/QUALITY_SCORECARD.md` — grade each domain, target weak areas with `/improve`
- **Log learnings** in `docs/LEARNINGS.md` — every failure becomes a permanent fix

## Inspirations

- [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/) — Repo as system of record, progressive disclosure, entropy management
- [gstack](https://github.com/garrytan/gstack) (Garry Tan) — Explicit cognitive modes, fix-first review
- [autoresearch](https://github.com/karpathy/autoresearch) (Karpathy) — Closed-loop iteration, mechanical metrics, git as memory
- [autoresearch fork](https://github.com/uditgoenka/autoresearch) (Udit Goenka) — Generalized loop protocol with guard commands
