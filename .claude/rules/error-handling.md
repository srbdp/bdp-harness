# Error Handling

- Wrap external calls (APIs, databases, file I/O) in try/catch
- Never swallow errors silently — always log or propagate
- Never expose stack traces or internal details to end users
- Use typed error responses with consistent structure
- Fail fast on invalid data — validate inputs at the boundary
- Use exponential backoff for retries on transient failures
