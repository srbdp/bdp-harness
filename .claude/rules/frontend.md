---
# Customize these paths for your framework
paths:
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "src/**/*.vue"
  - "src/**/*.svelte"
  - "components/**/*.tsx"
  - "components/**/*.jsx"
  - "components/**/*.vue"
  - "components/**/*.svelte"
  - "app/**/*.tsx"
  - "app/**/*.jsx"
---
# Frontend Conventions

- Use the project's existing component library — don't introduce new UI libraries
- Show skeleton loaders during data fetches, error boundaries on failures
- Keep components small — if a component exceeds ~150 lines, split it
- Use semantic HTML elements where possible
- Verify visual changes with screenshots or browser testing
