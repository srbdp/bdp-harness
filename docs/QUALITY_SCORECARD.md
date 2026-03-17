# Quality Scorecard

Track quality across domains over time. Inspired by OpenAI's entropy management — agents replicate patterns (even bad ones), so track quality explicitly and run `/improve` against weak areas.

Update this periodically. The `/improve` skill can target any row here.

---

| Domain | Grade | Last Checked | Target | Notes |
|--------|-------|-------------|--------|-------|
| Test coverage | - | - | 80%+ | `npm test -- --coverage` |
| Type safety | - | - | 0 errors | `npm run typecheck` |
| Build health | - | - | Clean | `npm run build` |
| Lint cleanliness | - | - | 0 warnings | `npm run lint` |
| Bundle size | - | - | <500KB | `npm run build && du -sh dist/` |
| API consistency | - | - | All endpoints validated | Zod on every boundary |
| Documentation | - | - | Current | Check docs/ vs actual code |

---

## Grading Scale

| Grade | Meaning |
|-------|---------|
| A | Excellent — meets or exceeds target |
| B | Good — minor gaps, no blockers |
| C | Needs work — known gaps affecting quality |
| D | Poor — active problems, should be addressed soon |
| F | Broken — immediate attention required |

## How to Use

1. Run the verify command for each domain
2. Update the grade and date
3. For any domain at C or below, consider running `/improve` with a mechanical metric
4. Log the improvement session results in the domain's notes
