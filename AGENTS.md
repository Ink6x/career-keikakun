# AGENTS.md

This repository contains the design-ready キャリアけいかくん demo app. Use this file as
the first operational guide for any agent or developer working in this
workspace.

## Project Overview

キャリアけいかくん is a Japanese-first career preparation demo app. A user provides a
career history and a target job posting, then the app produces:

- match score and score breakdown
- requirement coverage and skill map
- evidence gaps and evidence materials
- a 12-week preparation plan
- weekly review workflow
- Interview Studio
- Process Trace for provider, validation, scoring, and audit visibility

The project is a portfolio-grade AI product demo, not a production SaaS.

Primary stack target:

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Vitest
- Playwright
- provider adapters for `mock`, `openai`, and `anthropic`

## Current Development Status

The major product, UI, system, schema, Prisma, scoring, taxonomy, and fixture
decisions are documented. Implementation can begin from the current docs.

Before writing application code, read:

1. `docs/README.md`
2. `docs/agent-development-guide.md`
3. `docs/system-design.md`
4. `docs/schema-design.md`
5. `docs/skill-taxonomy-design.md`
6. `docs/scoring-design.md`
7. `docs/fixture-design.md`
8. `docs/prisma-design.md`
9. `docs/ui-design.md`
10. `DESIGN.md`

`docs/project-overview.md` is background context only. Prefer the canonical
documents above when there is a conflict.

## Setup Commands

The app scaffold may not exist yet. Once implementation begins, use these
commands unless package scripts intentionally change:

- Install dependencies: `corepack pnpm install`
- Start dev server: `corepack pnpm dev`
- Build: `corepack pnpm build`
- Typecheck/lint/check: `corepack pnpm check`
- Test: `corepack pnpm test`
- E2E: `corepack pnpm test:e2e`
- Prisma generate: `corepack pnpm prisma generate`
- Prisma migrate dev: `corepack pnpm prisma migrate dev`

Do not add or modify `.env` files. Use `.env.example` for documented variables
if needed.

## Architecture Rules

- Route Handlers own durable workflows: persistence, provider calls, pipeline
  execution, review submission, interview evaluation, evidence updates, Process
  Trace reads, and API-style integration tests.
- Server Actions are UI adapters only. They may wrap forms, redirects, and local
  UI transitions, but must call the same application services as Route
  Handlers.
- Provider calls must go through provider adapters and Zod validation.
- Real providers are tried first when configured; deterministic mock fallback
  must support the full public demo without API keys.
- Scoring, state transitions, schema validation, audit events, privacy filters,
  and idempotency are deterministic application logic, not LLM decisions.
- Embeddings may support adjacent-skill classification only. They must not add
  directly to the final score.
- Evidence Builder is an evidence material board, not a prose generation tool.
- Process Trace must not expose raw user input, raw prompts, raw completions,
  stack traces, SQL errors, or plaintext encrypted payloads.

## Data And Privacy Rules

- Use generated sample data only. Do not include real client, customer, employer,
  or personal data.
- The main fixture persona is BtoB SaaS Customer Success moving toward Product
  Operations / Customer Success Operations.
- Raw career history, job posting, review answer, and interview answer text are
  not persisted by default.
- If raw storage consent exists, store encrypted payloads through `RawPayload`.
- `RawPayload` must be clearable without deleting derived analysis records.
- Never commit secrets or `.env` files.

## UI Rules

- The first screen is an app entry point, not a marketing landing page.
- Start screen is one section and does not show the step bar.
- The guided step bar starts after the user selects sample data or own content.
- Workspace appears only after analysis completes.
- Mobile workspace navigation uses a horizontally scrollable top tab bar, not a
  hamburger menu.
- AI coach persona is supportive but objective and direct, like a practical
  cram-school teacher for career preparation.
- Avoid playful chatbot styling and avoid hiring, salary, or career outcome
  guarantees.

## Code Style

- Prefer simple, typed, testable modules.
- Keep domain logic outside React components.
- Validate all external input with Zod.
- Use Prisma parameterized queries; do not concatenate SQL.
- Keep UI components composed and scoped to their screens unless reuse is clear.
- Do not add broad abstractions until they remove real duplication or complexity.
- Do not store raw provider responses as business data.

## Testing Instructions

Minimum test coverage should include:

- scoring logic unit tests
- skill normalization and alias mapping tests
- Zod schema validation tests for provider outputs
- fixture tests for `medium-main`, `high-match`, and `low-match`
- mock provider tests for the main analysis flow
- review structuring and plan update tests
- interview question generation and evaluation tests
- evidence board derivation and status update tests
- raw-storage consent, encryption, clear, and failure tests
- idempotency tests for analysis and pipeline retries
- E2E smoke test for sample-data full flow

Run the smallest relevant test first, then broader validation.

## Security And Safety

- Never commit secrets.
- Never change or commit `.env` files.
- Ask before changing authentication, billing, production infrastructure, or
  destructive data operations.
- Redact customer, production, or personal data.
- Do not run destructive commands unless explicitly requested.

## PR / Handoff Instructions

Summaries should include:

- what changed
- why it changed
- how it was tested
- screenshots for UI changes
- any remaining risk or test gap

Keep changes scoped to the requested task.

## Project-Specific Gotchas

- `AnalysisSession.status` represents only the initial analysis pipeline.
  Review, Interview, and Evidence progress are derived from child records.
- `JobPosting.roleTitle`, `AnalysisSession.extractedTargetRoleTitle`, and
  `CareerPlan.targetRole` are persisted separately, but UI shows one target role
  label.
- Generic provider `confidence` fields are not accepted. Only adjacent-skill
  diagnostic scores such as `adjacencyScore` / `similarityScore` are allowed.
- The first implementation includes `RawPayload`, Process Trace, audit, schema
  validation, and mock fallback.

## Reference Docs

- `docs/README.md`
- `docs/agent-development-guide.md`
- `docs/system-design.md`
- `docs/schema-design.md`
- `docs/skill-taxonomy-design.md`
- `docs/scoring-design.md`
- `docs/fixture-design.md`
- `docs/prisma-design.md`
- `docs/ui-design.md`
- `DESIGN.md`

## gitworkflow

- Use small, focused commits and pull requests; do not mix unrelated changes.
- Write commit messages in Conventional Commits format, e.g. `feat(auth): add login validation`.
- Use clear branch names such as `feature/...`, `fix/...`, `refactor/...`, `docs/...`, or `chore/...`.
- Before opening a pull request, run relevant tests, linters, and formatters when available.
- Pull requests should include a concise summary, testing notes, and any risks or follow-up items.
- Never commit secrets, credentials, `.env` files, or unrelated generated files.