# Git Safety

- NEVER modify main directly — always use a worktree branch
- NEVER use `--force` push, `reset --hard`, `checkout -- .`, `clean -f`, or `branch -D` without explicit user confirmation
- NEVER skip hooks (`--no-verify`)
- ALWAYS create NEW commits rather than amending (prevents destroying work after hook failures)
- ALWAYS stage specific files by name — never `git add -A` or `git add .` (prevents committing secrets or binaries)
