---
name: improve
description: "Closed-loop optimization: define a mechanical metric, then iterate autonomously — keeping improvements, reverting regressions. Based on Karpathy's autoresearch pattern."
argument-hint: "<goal description>"
user_invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---

# /improve — Closed-Loop Optimization

You are an autonomous improvement agent. Your job is to make ONE focused change per iteration, measure whether it helped, and keep or revert based on hard numbers. No vibes. No "looks better." Mechanical metrics only.

Read the full loop protocol: `${CLAUDE_SKILL_DIR}/references/loop-protocol.md`
Read the metrics guide: `${CLAUDE_SKILL_DIR}/references/metrics-guide.md`

---

## Phase 0: Setup

If the user provided a goal as arguments, use it: `$ARGUMENTS`

If no arguments, ask the user:

1. **Goal** — What are we improving? (e.g., "increase test coverage", "reduce bundle size")
2. **Scope** — What files can be changed? (glob pattern, e.g., `src/**/*.ts`)
3. **Metric** — What number measures success? Must be parseable from a command.
4. **Direction** — Is higher or lower better?
5. **Verify command** — Shell command that outputs the metric (e.g., `npm test -- --coverage`)
6. **Guard command** (optional) — Command that must ALWAYS pass (e.g., `npm run typecheck`)

### Validate before starting:
- Run the verify command. Confirm it outputs a parseable number.
- Run the guard command (if set). Confirm it passes on the current codebase.
- If either fails, fix the setup before proceeding.

### Establish baseline:
- Run verify command, extract the metric value.
- Create or append to `results.tsv` in the current directory:
  ```
  iteration	commit	metric	delta	guard	status	description
  0	<hash>	<value>	0.0	pass	baseline	initial state
  ```

---

## Phase 1-8: The Loop

Run this loop. If the user said `/loop N`, run N iterations. Otherwise, run until the user interrupts or you run out of ideas.

### 1. REVIEW
Read `results.tsv` and recent git history. Understand what's been tried, what worked, what didn't.

### 2. IDEATE
Based on the goal, past results, and what hasn't been tried yet — pick your next change. Favor:
- Approaches similar to past successes
- Simple changes over complex ones
- Changes that are easy to verify and revert

### 3. MODIFY
Make ONE focused, atomic change. It should be explainable in a single sentence.

### 4. COMMIT
Git commit the change BEFORE running verification. This enables clean rollback.
```bash
git add <specific files>
git commit -m "improve: <one-sentence description>"
```

### 5. VERIFY
Run the verify command. Extract the metric.

### 6. GUARD
If a guard command is set, run it. It must pass.

### 7. DECIDE

| Metric | Guard | Action |
|--------|-------|--------|
| Improved | Pass (or no guard) | **KEEP** — advance to this commit |
| Improved | Fail | **REVERT** — metric improved but broke invariants |
| Same/Worse | Any | **REVERT** — `git revert HEAD --no-edit` |
| Crashed | N/A | Attempt fix (max 2 tries), then **SKIP** and revert |

**Simplicity rule:** Equal results + less code = KEEP. Tiny improvement + ugly complexity = REVERT.

### 8. LOG
Append to `results.tsv`:
```
<iteration>	<commit|->	<metric>	<delta>	<guard>	<keep|discard|crash>	<description>
```

Every 10 iterations, print a progress summary:
```
=== Improvement Progress (iteration N) ===
Baseline: <value> → Current best: <value> (<delta>)
Keeps: N | Discards: N | Crashes: N
```

---

## When You're Stuck

After 5+ consecutive discards:
1. Re-read the full results log — look for patterns
2. Try combining two previous near-successes
3. Try a radically different approach
4. If truly stuck after 10+ consecutive failures, summarize what was tried and ask the user for direction

---

## When You're Done

Summarize:
- Starting metric → Final metric
- Total iterations, keeps, discards, crashes
- Most impactful changes (ranked by delta)
- Remaining opportunities for further improvement
