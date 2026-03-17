# Metrics Guide

How to define mechanical metrics for the `/improve` skill.

## What Makes a Good Metric

A metric MUST be:
- **A parseable number** — not "PASS"/"FAIL", not subjective, a number
- **Extractable by shell command** — the verify command outputs it
- **Deterministic** — same input produces same output (within reasonable variance)
- **Fast** — under 30 seconds ideal, under 2 minutes acceptable

## Common Metrics by Domain

| Domain | Metric | Verify Command | Direction | Guard |
|--------|--------|---------------|-----------|-------|
| Test coverage | Coverage % | `npm test -- --coverage 2>&1 \| grep 'All files' \| awk '{print $4}'` | Higher | `npm run typecheck` |
| Bundle size | Size in bytes | `npm run build 2>/dev/null && stat -f%z dist/index.js` | Lower | `npm test` |
| Page load | Lighthouse perf score | `npx lighthouse http://localhost:3000 --output=json --quiet \| jq '.categories.performance.score * 100'` | Higher | `npm test` |
| Build time | Seconds | `{ time npm run build; } 2>&1 \| grep real \| awk '{print $2}'` | Lower | `npm test` |
| Code complexity | Avg cyclomatic | `npx cr src/ --format json \| jq '.reports[].complexity.cyclomatic' \| awk '{s+=$1; n++} END {print s/n}'` | Lower | `npm test` |
| Lint issues | Error count | `npm run lint 2>&1 \| grep -c 'error'` | Lower | `npm run typecheck` |
| API response time | Milliseconds | `curl -s -o /dev/null -w '%{time_total}' http://localhost:3000/api/health \| awk '{print $1*1000}'` | Lower | `npm test` |
| Dependencies | Count | `jq '.dependencies \| length' package.json` | Lower | `npm test` |
| Lines of code | LOC | `find src -name '*.ts' \| xargs wc -l \| tail -1 \| awk '{print $1}'` | Lower (for refactoring) | `npm test` |

## The Guard Command

The guard is a secondary check that must ALWAYS pass, independent of the metric being optimized. It prevents regressions.

**Pattern:** Optimize metric X while guard ensures Y never breaks.

| Optimizing | Guard | Why |
|-----------|-------|-----|
| Test coverage | Typecheck | Don't break types while adding tests |
| Bundle size | Tests pass | Don't remove functionality while shrinking |
| Performance | Tests pass | Don't break correctness while optimizing |
| Code reduction | Tests pass | Don't lose behavior while simplifying |

## Extracting the Number

The verify command must output a number that can be parsed. Techniques:

```bash
# grep + awk for extracting from mixed output
npm test -- --coverage 2>&1 | grep 'All files' | awk '{print $4}'

# jq for JSON output
npx lighthouse --output=json | jq '.categories.performance.score'

# wc for counting
find src -name '*.test.ts' | wc -l

# stat for file sizes
stat -f%z dist/bundle.js

# curl timing
curl -s -o /dev/null -w '%{time_total}' http://localhost:3000/api/health
```

## Tips

- **Start with the easiest wins.** The first few iterations of an improvement loop usually yield the biggest gains.
- **Define the guard early.** It's tempting to skip it. Don't. The guard is what prevents the agent from "improving" the metric by breaking everything else.
- **Use fast metrics.** If your verify command takes 5 minutes, the loop will be painfully slow. Find a faster proxy metric if possible.
- **Check the baseline.** If the baseline is already near the target, the loop may not have much room to improve. Set realistic goals.
