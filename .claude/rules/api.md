---
# Customize these paths for your framework
paths:
  - "src/app/api/**/*.ts"
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
  - "src/server/**/*.ts"
  - "api/**/*.ts"
  - "app/api/**/*.ts"
  - "pages/api/**/*.ts"
  - "server/**/*.ts"
---
# API Conventions

- Validate all external inputs with schemas (Zod or equivalent)
- Return structured JSON: `{ data: ... }` on success, `{ error: string }` on failure
- Use try/catch with proper error serialization — never expose stack traces
- Never call config/env functions at module scope — always inside handler functions
- Parse at the boundary, trust internally (parse, don't validate)
