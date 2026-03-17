# Code Change Workflow

Every code change follows this sequence. No exceptions.

1. `git worktree prune` to clear stale references
2. `git worktree add .claude/worktrees/<name> -b <name>` to create an isolated worktree
3. Work in the worktree — write failing tests first, then implement
4. Run `/simplify` for code quality review
5. Run `/pr-review-toolkit:review-pr` for comprehensive pre-merge review
6. Merge to main: `cd` back to main repo, `git merge <name>`
7. Clean up: `git worktree remove .claude/worktrees/<name>`

For larger tasks, use agent teams — each builder gets its own worktree.

When something goes wrong during development and you engineer a fix (a hook, a rule, a test), log it in `docs/LEARNINGS.md` so the fix compounds across sessions.
