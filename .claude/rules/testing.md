# Test-First Development

- Write unit tests BEFORE implementation code
- Tests define the specification — implementation must match test intent
- Run `npm run test` after every change to verify
- Mock external dependencies (API clients, fetch calls, env vars)
- Test the contract (inputs/outputs), not the implementation (internal calls)
- Co-locate test files with source: `feature.ts` → `feature.test.ts`
