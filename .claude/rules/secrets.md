# Secrets Management

- Never hardcode secrets, API keys, or credentials in source code
- Use `.env` for local secrets and `.env.example` (with placeholder values) as a template
- Never log secrets or include them in error messages
- Verify `.gitignore` includes `.env*` before committing
- Store production secrets in environment variables or a secrets manager, never in the repo
