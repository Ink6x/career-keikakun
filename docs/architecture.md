# キャリアけいかくん Architecture

Last updated: 2026-05-15

## Runtime Shape

The current implementation is a vertical-slice public demo:

- UI: Next.js App Router pages and client components.
- API: resource-oriented Route Handlers under `/api/analysis-sessions`.
- Domain: Zod schemas, scoring, taxonomy, fixture, privacy, and mock pipeline modules under `src/lib/keikakun`.
- Persistence target: Prisma schema for PostgreSQL in `prisma/schema.prisma`.
- Demo runtime: in-memory `session-store` so the sample flow works without a database during early development.

## AI Boundary

LLM/provider responsibilities are intentionally behind an adapter boundary. The current public demo uses deterministic mock output. Production provider work should fill in `src/server/providers/provider-adapter.ts` without moving provider calls into React components.

Code owns:

- request validation
- provider output validation
- skill normalization
- scoring
- workflow state updates
- privacy filtering
- trace and audit event shapes

LLM/provider output may later provide:

- semantic extraction
- Japanese explanation text
- plan drafts
- interview feedback drafts

## Privacy Boundary

Trace, audit, provider metadata, and API views must not contain raw career history, raw job posting, raw review answers, raw interview answers, raw prompts, or raw completions. Use hashes, short summaries, validation results, and structured rows.

Raw storage remains opt-in and must use encrypted `RawPayload` records. Clearing raw storage should not delete derived analysis records.

## Next Implementation Step

Replace the in-memory store with a Prisma repository while keeping the same service/API contracts. The UI should not need to know whether data came from the demo store or PostgreSQL.
