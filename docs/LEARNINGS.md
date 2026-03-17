# Learnings Log

A running log of problems encountered during development and the solutions engineered to prevent them from recurring. This is the "engineer solutions for every failure, once" principle in action.

Each entry captures: what went wrong, why, and what was put in place (hook, rule, test, or convention) so it never happens again. The harness gets smarter over time.

---

## Format

```
### YYYY-MM-DD — [Short title]
**Problem:** What went wrong.
**Root cause:** Why it happened.
**Solution:** What was engineered (hook, rule, test, CLAUDE.md update, etc.).
**Files changed:** What was added or modified to prevent recurrence.
```

---

## Log

<!-- Add entries below as problems are encountered and solved -->
<!-- Example:

### 2026-03-17 — Agent force-pushed to main
**Problem:** Agent ran `git push --force origin main`, overwriting teammate's commits.
**Root cause:** No guardrail on destructive git operations.
**Solution:** Added PreToolUse hook in `.claude/settings.json` that blocks force push, reset --hard, clean -f, and branch -D.
**Files changed:** `.claude/settings.json`, `.claude/rules/git-safety.md`

### 2026-03-18 — Type errors shipped to main
**Problem:** Agent merged code with TypeScript errors because it didn't run tsc before committing.
**Root cause:** No automated type checking in the workflow.
**Solution:** Added Stop hook that runs `tsc --noEmit` after every agent response. Exit code 2 re-engages agent to fix errors.
**Files changed:** `.claude/settings.json`

-->
