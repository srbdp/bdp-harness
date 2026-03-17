#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# init.sh — Setup validation for bdp-harness
# Checks prerequisites and project readiness.
# ─────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

pass=0
todo=0
fail=0

ok()   { echo -e "  ${GREEN}OK${RESET}    $1"; ((pass++)) || true; }
todo() { echo -e "  ${YELLOW}TODO${RESET}  $1"; ((todo++)) || true; }
fail() { echo -e "  ${RED}FAIL${RESET}  $1"; ((fail++)) || true; }

echo ""
echo -e "${BOLD}bdp-harness — Setup Check${RESET}"
echo "─────────────────────────────────────"

# ── Prerequisites ──

echo ""
echo -e "${BOLD}Prerequisites${RESET}"

if command -v node &>/dev/null; then
  ok "Node.js installed ($(node --version))"
else
  fail "Node.js not installed"
fi

if command -v git &>/dev/null; then
  ok "git installed ($(git --version | cut -d' ' -f3))"
else
  fail "git not installed"
fi

if command -v claude &>/dev/null; then
  ok "Claude Code CLI installed"
else
  todo "Claude Code CLI not installed — install from https://docs.anthropic.com/en/docs/claude-code"
fi

# ── Project Files ──

echo ""
echo -e "${BOLD}Project Configuration${RESET}"

if [[ -f CLAUDE.md ]]; then
  if grep -q '\[2-3 sentences:' CLAUDE.md; then
    todo "CLAUDE.md still contains placeholder text — customize it for your project"
  else
    ok "CLAUDE.md customized"
  fi
else
  fail "CLAUDE.md not found"
fi

if [[ -f package.json ]]; then
  ok "package.json exists"
else
  fail "package.json not found — run npm init"
fi

# ── NPM Scripts ──

echo ""
echo -e "${BOLD}Required npm Scripts${RESET}"

required_scripts=(dev test build lint typecheck)

if [[ -f package.json ]]; then
  for script in "${required_scripts[@]}"; do
    if grep -q "\"$script\"" package.json; then
      ok "npm run $script defined"
    else
      todo "npm run $script not defined in package.json"
    fi
  done
else
  for script in "${required_scripts[@]}"; do
    fail "Cannot check npm run $script — package.json missing"
  done
fi

# ── TypeScript ──

echo ""
echo -e "${BOLD}TypeScript${RESET}"

if [[ -f tsconfig.json ]]; then
  ok "tsconfig.json exists"
else
  todo "tsconfig.json not found — needed for typecheck hook"
fi

# ── Inputs ──

echo ""
echo -e "${BOLD}Inputs${RESET}"

if [[ -d inputs ]]; then
  file_count=$(find inputs -type f ! -name '.gitkeep' | wc -l | tr -d ' ')
  if [[ "$file_count" -gt 0 ]]; then
    ok "inputs/ has content ($file_count file(s))"
  else
    todo "inputs/ is empty — add your PRD or spec documents"
  fi
else
  todo "inputs/ directory not found"
fi

# ── Summary ──

echo ""
echo "─────────────────────────────────────"
total=$((pass + todo + fail))
echo -e "${BOLD}Summary:${RESET} $total checks — ${GREEN}${pass} OK${RESET}, ${YELLOW}${todo} TODO${RESET}, ${RED}${fail} FAIL${RESET}"
echo ""

if [[ $fail -gt 0 ]]; then
  echo -e "${RED}Fix FAIL items before proceeding.${RESET}"
  exit 1
elif [[ $todo -gt 0 ]]; then
  echo -e "${YELLOW}Project is usable but has TODO items to address.${RESET}"
  exit 0
else
  echo -e "${GREEN}All checks passed — ready to build.${RESET}"
  exit 0
fi
