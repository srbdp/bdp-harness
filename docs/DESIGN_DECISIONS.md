# Design Decisions

Non-obvious constraints and the reasoning behind them. The agent reads this to understand WHY things are the way they are, not just WHAT they are.

Update this whenever you make a decision that a future developer (or agent) would find surprising.

---

## Format

Each decision follows:
- **Decision**: What was decided
- **Context**: What problem or tradeoff prompted this
- **Rationale**: Why this choice over alternatives
- **Alternatives considered**: What else was on the table

---

## Decisions

<!-- Add entries below as design decisions are made -->
<!-- Example:

### Use Supabase instead of raw Postgres
**Decision:** All database access goes through Supabase client, not direct Postgres connections.
**Context:** Need auth, real-time subscriptions, and storage alongside the database.
**Rationale:** Supabase bundles auth + DB + storage + real-time in one SDK. Less infrastructure to manage. Good enough for our scale.
**Alternatives considered:** Raw Postgres + separate auth service, Firebase, PlanetScale.

### Lazy-init pattern for all clients
**Decision:** All external service clients (Supabase, API clients) use lazy initialization — never instantiated at module scope.
**Context:** Next.js evaluates modules at build time. Env vars may not be available yet.
**Rationale:** Lazy-init via Proxy or getter functions ensures clients are only created when actually used at runtime, avoiding build-time crashes.
**Alternatives considered:** Environment variable checks at module scope (fragile), build-time injection (complex).

-->
