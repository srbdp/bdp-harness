# The Improvement Loop Protocol

Based on Karpathy's autoresearch (autonomous ML research) and Udit Goenka's generalization to any domain with a mechanical metric.

## Core Insight

Effective autonomy emerges when you constrain scope, clarify success, and mechanize verification.

## The 7 Principles

1. **Constraint as enabler.** Limiting what can change (scope) and how success is measured (metric) is what makes autonomous iteration possible. Without constraints, the agent wanders.

2. **Strategy vs. tactics separation.** The human defines direction ("improve test coverage to 90%"). The agent handles implementation ("add edge case tests for auth middleware"). Human writes the goal; agent writes the code.

3. **Mechanical metrics required.** Success must be a parseable number from a shell command. Not "looks better." Not "feels faster." A number.

4. **Fast verification.** When verification takes longer than the work itself, the incentive structure breaks. Prefer fast checks (unit tests in seconds) over slow ones (full E2E suites in minutes).

5. **Iteration cost matters.** Cheap iterations encourage bold exploration. Expensive iterations promote conservatism. Structure the loop so each cycle is fast.

6. **Git as system memory.** Every successful change is committed. The agent reads its own history to learn patterns. Git log IS the experiment journal.

7. **Honest limitations.** When stuck, say so. Don't pretend progress. Summarize what was tried and ask for direction.

## The Setup Phase

Before the loop starts, validate everything:

| Parameter | What | Validation |
|-----------|------|------------|
| Goal | What "better" means | Human provides |
| Scope | Files that can change | Glob must resolve to >=1 file |
| Metric | Parseable number | Verify command must output a number |
| Direction | Higher or lower is better | Human specifies |
| Verify | Command that outputs the metric | Must succeed and produce extractable number |
| Guard | Command that must always pass | Must pass on current codebase |

## The Loop

```
LOOP:
  1. REVIEW   — Read results.tsv + git log + current code state
  2. IDEATE   — Pick next change (informed by what worked/failed)
  3. MODIFY   — ONE atomic change (explainable in one sentence)
  4. COMMIT   — Before verification (git is the undo mechanism)
  5. VERIFY   — Run verify command, extract metric
  6. GUARD    — Run guard command (if set)
  7. DECIDE   — Keep / Revert / Fix
  8. LOG      — Append to results.tsv
```

## Decision Matrix

| Metric | Guard | Action |
|--------|-------|--------|
| Better | Pass | KEEP — advance |
| Better | Fail | REVERT — broke invariants |
| Same/Worse | Pass | REVERT — no improvement |
| Same/Worse | Fail | REVERT — no improvement + broke things |
| Crash | N/A | Fix (max 2 tries) or SKIP |

## The "Equal or Simpler" Rule

- Equal results + less code = **KEEP** (simplification is a win)
- Tiny improvement + significant complexity = **REVERT** (not worth the maintenance cost)
- Large improvement + any amount of complexity = **KEEP** (the gains justify it)

## Progress Tracking

Results are logged in TSV format:
```
iteration	commit	metric	delta	guard	status	description
0	a1b2c3d	85.2	0.0	pass	baseline	initial state
1	b2c3d4e	87.1	+1.9	pass	keep	add auth edge case tests
2	-	86.5	-0.6	-	discard	refactor helpers (broke 2 tests)
```

Progress summaries every 10 iterations:
```
=== Improvement Progress (iteration 20) ===
Baseline: 85.2% → Current best: 92.1% (+6.9%)
Keeps: 8 | Discards: 10 | Crashes: 2
```

## Stuck Protocol

After 5+ consecutive failures:
1. Re-read the full results log for patterns
2. Combine two previous near-successes
3. Try a radically different approach
4. After 10+ failures, summarize and ask the human
