# キャリアけいかくん Agent Development Guide

Last updated: 2026-05-15

This document is the implementation handoff guide for agents building the
キャリアけいかくん demo app. It captures the agreed product scope, UI references,
backend and AI architecture, implementation guardrails, and acceptance
expectations.

Use this document as the primary development guide. Use `docs/system-design.md`
for backend behavior, `docs/schema-design.md` for planned Zod contracts,
`docs/skill-taxonomy-design.md` for skill taxonomy and alias policy,
`docs/scoring-design.md` for deterministic match scoring,
`docs/prisma-design.md` for persistence mapping, `docs/ui-design.md` for
screen behavior and information architecture, and `DESIGN.md` for visual
tokens, components, layout, and responsive rules.

## 1. Product Goal

キャリアけいかくん is a Japanese-first career preparation demo app.

The app helps a user paste a career history and a target job posting, then see:

- a match score
- strengths and priority gaps
- job requirement coverage
- normalized skill mapping
- evidence gaps
- a 90-day preparation plan
- a weekly review workflow
- an Evidence Builder for tracking evidence materials and portfolio proof points
- a Process Trace that shows how the AI pipeline was controlled

The visible product should feel like a clear toC web app. The implementation
should prove professional AI workflow engineering depth to contract clients,
recruiters, and technical reviewers.

The project should demonstrate that the developer can build AI features as
controlled product workflows, not just prompt an LLM and display text.

## 2. Confirmed Scope Decisions

The project is no longer scoped as a small first phase. The first implementation should
build the full public demo experience in one pass:

- Analyze
- Plan
- Review
- Evidence Builder
- Process Trace
- README, architecture notes, tests, and CI

This is still a portfolio demo, not a production SaaS. Do not add billing, real
job-board APIs, email sending, Slack/Notion integrations, or production
operations tooling.

Session handling is anonymous. The app should not require account registration.
It should create a browser/session-level identity and store analysis history
against that anonymous visitor.

Provider execution is real-first. If provider environment variables are
configured, the app should try the selected real provider first. If not
configured, unavailable, or failing validation, it must fall back to deterministic
mock outputs so the full demo remains usable without API keys.

## 3. Confirmed UX Scope

The confirmed app flow is:

```text
Start
  -> Input / Analyze
  -> Workspace
       - Analyze
       - Plan
       - Review
       - Evidence Builder
       - Process Trace
```

### Start

The first screen starts the app experience. It is not a marketing landing page.
It is a single entry section and does not show the guided step bar.

Required choices:

- Try with sample data.
- Analyze my own content.

The guided step bar starts on the next screen after either choice is selected.

### Input / Analyze

Initial input is intentionally small:

- career history text
- job posting text

Do not add account registration, profile setup, file upload, job API search, or
target role as a separate required field. The target role should be
extracted from the job posting.

Show the guided step bar here, not on the Start screen. Recommended labels:

```text
Content input / check -> AI analysis -> Workspace
```

Loading should expose the pipeline:

- Structuring career history
- Extracting job requirements
- Normalizing skills
- Calculating match score
- Creating 90-day plan

### Workspace

The workspace menu appears only after analysis is complete.

Navigation labels:

- Analyze
- Plan
- Review
- Evidence Builder
- Process Trace

Mobile workspace navigation should use a horizontally scrollable top tab bar,
not a hamburger menu.

Route map:

- `/`: Start screen.
- `/analyze`: Input, quality checks, and pipeline loading.
- `/workspace/[sessionId]/analyze`: score, findings, coverage, skill map, gaps,
  and next action.
- `/workspace/[sessionId]/plan`: 12-week plan.
- `/workspace/[sessionId]/review`: weekly review flow.
- `/workspace/[sessionId]/evidence`: Evidence Builder.
- `/workspace/[sessionId]/trace`: Process Trace.

## 4. Product Screens

### Analyze

Analyze is the core result screen. It combines score-first summary with deeper
evidence and requirement coverage.

Required sections:

1. Score Summary
2. Key Findings
3. Requirement Coverage
4. Skill Map
5. Evidence Gaps
6. Next Action

### Mobile Layout Rules

- Workspace navigation: horizontally scrollable top tab bar.
- Review: chat flow first; week plan and collected summary are secondary and
  collapsible.
- Evidence Builder: compact filter chips and material list first; selected
  material detail below or drill-in.
- Process Trace: vertical event list instead of dense tables.
- Touch targets should be at least 44px.

Score Summary must include:

- match score
- verdict label
- extracted target role or job title
- required requirement coverage
- preferred requirement coverage
- evidence strength
- skill proximity

Requirement Coverage must show requirement-level reasoning:

- requirement
- type: required or preferred
- status: matched, partial, or missing
- weight
- evidence from profile
- gap note

### Plan

Plan turns the analysis into a 90-day preparation plan.

Use 12 weekly cards. Each card must include:

- week number
- objective
- tasks
- evidence to create
- review prompt
- review button

Keep `evidence to create`; it is central to the product concept.

### Review

Review is a chat-guided structured weekly check-in.

The UI should feel conversational, but the stored result must be structured.

User experience:

- A practical career coach bot asks focused questions.
- The coach persona is supportive but objective and direct, similar to a
  cram-school teacher for career preparation.
- The user answers in natural language.
- The bot collects progress, blockers, artifacts, and next intent.
- The user applies the review to update the plan.

Internal structure:

- weekNumber
- completedWork
- blockers
- artifactsCreated
- learningNotes
- nextWeekIntent
- progressStatus
- planAdjustments
- evidenceUpdates

Do not build an unlimited generic chatbot. Use a guided question flow with at
most one optional follow-up.

Coach feedback should critique evidence, answers, and preparation state rather
than the user's personality. It should clearly identify weak or generic parts
and pair them with concrete next actions.

### Evidence Builder

Evidence Builder is an evidence material board. It turns analysis, reviews, and
plan work into structured records of proof the user should create, collect, or
improve.

It does not generate resume bullets, README sections, or other prose drafts in
the first design. The product value is evidence organization and progress
tracking, not document writing.

Each evidence material should show:

- title
- proof type
- source gap or requirement
- why it matters
- evidence to create
- next action
- source: analysis, plan, or review
- target week when available
- status: not started, in progress, ready, or archived

Evidence Builder must not claim that a material proves hiring success. It should
frame materials as preparation targets and public proof candidates.

### Process Trace

Process Trace is technical proof for clients and reviewers.

Show:

- pipeline step names
- provider mode
- embedding mode
- schema validation results
- scoring breakdown
- audit events
- provider fallback events
- timestamps

Workspace UI should show only compact provider mode: `Real`, `Fallback`, or
`Mock`. Provider failure reasons, validation failures, and fallback reason codes
belong in Process Trace.

Do not show full raw user input. Use summaries, hashes, structured outputs, and
status rows.

## 5. Backend And AI Architecture

### Stack Decisions

- Next.js, TypeScript, React, and Tailwind CSS.
- PostgreSQL + Prisma for full demo persistence and future production-like
  scaling.
- Zod for schema validation.
- Vitest for unit and fixture tests.
- Provider adapters for `mock`, `openai`, and `anthropic`.
- Local embedding fallback, with optional provider embeddings when configured.

### Language And Data

- UI, sample data, and user-facing AI output are Japanese-first.
- Technical identifiers, schema names, and Process Trace step names may remain
  English.
- Use the fixture direction in `docs/fixture-design.md`.
- Main public demo persona: BtoB SaaS customer success moving toward Product
  Operations / Customer Success Operations.
- Include three deterministic fixture cases:
  - `medium-main`
  - `high-match`
  - `low-match`
- Do not persist raw career history or raw job posting by default.
- Include opt-in encrypted raw storage in the first implementation. Persist raw
  input only when the user explicitly consents to raw storage for reanalysis or
  editing.
- Persist derived structured data, summaries, hashes, scores, plans, reviews,
  and trace events.

### Provider Strategy

All LLM calls must go through a provider adapter.

Provider priority:

- `openai`: real provider when `AI_PROVIDER=openai` and env vars are configured.
- `anthropic`: real provider when `AI_PROVIDER=anthropic` and env vars are
  configured.
- `mock`: deterministic local fallback for no-key environments, failed provider
  calls, validation failures, demo stability, and tests.

Real provider use must never be required for the public demo. Mock fallback must
support the full flow without API keys.

### Embedding Strategy

Embeddings and local similarity may assist skill adjacency classification, but
embedding similarity scores must not be inserted directly into the final match
score. Final scoring remains deterministic and explainable.

Required modes:

- local fallback similarity for mock and no-key environments
- optional provider embedding for configured real providers

Process Trace should make the active embedding mode visible and state that
similarity is used for adjacency classification, with no direct score
contribution.

## 6. Pipeline Responsibility Split

Core principle:

LLM handles semantic interpretation and user-facing language. Code handles
validation, normalization, scoring, state transitions, audit events, and tests.

### `parseProfile`

LLM responsibilities:

- extract experience, achievements, skills, domains, decision-making examples,
  and evidence candidates from career history

Code responsibilities:

- input length checks
- hash raw input
- validate output with Zod
- persist derived output, summary, and hash by default
- persist encrypted raw input through `RawPayload` only when explicit
  raw-storage consent exists
- prevent raw input from appearing in Process Trace

Primary output: `CareerProfile`

### `extractJobRequirements`

LLM responsibilities:

- extract required requirements, preferred requirements, responsibilities,
  expected outcomes, and role title from the job posting

Code responsibilities:

- normalize requirement type to enums
- initialize requirement weight
- deduplicate requirements
- validate output with Zod
- persist derived output, summary, and hash by default
- persist encrypted raw input through `RawPayload` only when explicit
  raw-storage consent exists

Primary output: `JobRequirements`

### `normalizeSkills`

LLM responsibilities:

- help classify ambiguous or unknown skill expressions
- support category inference for non-obvious business skills

Code responsibilities:

- maintain skill taxonomy
- apply alias mapping
- apply deterministic adjacency rules after optional embedding-assisted
  candidate discovery
- canonicalize skill names
- merge duplicates
- preserve unknown skill mentions as pending normalization records
- compute local similarity fallback for adjacency candidates

Primary output: `NormalizedSkill[]`

### `scoreMatch`

LLM responsibilities:

- generate human-readable gap notes and explanation text

Code responsibilities:

- calculate required coverage
- calculate preferred coverage
- calculate evidence strength
- calculate skill proximity using deterministic rules over exact, alias,
  category, and accepted-adjacent matches
- apply the scoring weights from `docs/scoring-design.md`
- determine matched, partial, or missing per requirement
- calculate final match score
- produce scoring breakdown with `scoreVersion` and `weightVersion` for Process
  Trace

Primary output: `MatchAnalysis`

Scoring must not be delegated to the LLM.

### `generatePlan`

LLM responsibilities:

- draft weekly objectives, tasks, review prompts, and evidence ideas based on
  analyzed gaps

Code responsibilities:

- enforce 12-week structure
- validate required fields
- link plan items to gaps or requirements
- preserve priority from Evidence Gaps
- persist plan state

Primary output: `CareerPlan`

Plan generation must be constrained by Analyze results. Do not let the LLM write
a generic career plan without using requirement coverage and evidence gaps.

### `buildEvidenceBoard`

LLM responsibilities:

- none required for prose generation
- may provide short labels or summaries only if already available from prior
  structured outputs

Code responsibilities:

- derive evidence material records from evidence gaps and plan tasks
- preserve source links to requirements, gaps, and reviews
- enforce proof types, status enum, target week, and required fields
- avoid unsupported claims such as guaranteed hiring or salary gains
- validate output and persist evidence material state

Primary output: `EvidenceArtifact[]`, where each record represents a proof
material to create or track, not generated writing.

### `recordAuditEvent`

LLM responsibilities:

- none

Code responsibilities:

- record pipeline status
- record provider mode
- record embedding mode
- record validation status
- record input hash references
- record scoring breakdown references

Primary output: `AuditEvent`

## 7. Review Pipeline

Review is separate from the initial analysis pipeline.

```text
collectReviewConversation
structureWeeklyReview
updatePlanState
recordAuditEvent
```

### `collectReviewConversation`

Code controls the question flow. The LLM may generate practical, focused coach
copy, but the flow should remain bounded.

Required collection targets:

- completed work
- blockers
- artifacts created
- learning notes
- next week intent

### `structureWeeklyReview`

LLM responsibilities:

- convert natural language chat responses into structured review fields
- summarize the week in Japanese
- propose one optional follow-up question when required data is missing

Code responsibilities:

- validate structured review fields
- enforce week number
- prevent unlimited follow-up loops

### `updatePlanState`

Code responsibilities:

- update current week progress
- adjust next action
- add evidence updates
- create audit event

The LLM may generate user-facing summary text, but plan state transitions should
be deterministic.

## 8. Schema And Data Model Direction

Use PostgreSQL and Prisma as the schema target. The schema should support the
full demo flow: Analyze, Plan, Review, Evidence Builder, Process Trace, provider
observability, retries, and future account-based use.

The central unit is `AnalysisSession`. A session represents one analysis run and
owns the parsed profile, job requirements, normalized skills, match analysis,
90-day plan, reviews, process trace, and audit trail. New analysis runs should
create new sessions instead of overwriting prior results.

### Core Records

- `AnonymousVisitor`: browser/session-level identity for the public demo. Store
  visitor ID, locale, raw-storage policy, first/last seen timestamps, and
  optional future external auth subject.
- `UserProfile`: optional career context attached to an anonymous visitor.
  Include locale, current role, target role, target timeline, raw-storage
  policy, timestamps, and soft-delete fields.
- `AnalysisSession`: one analysis attempt. Store status, source, provider mode,
  embedding mode, optional user profile link, extracted target role title,
  idempotency key, schema version, and started/completed timestamps. The status
  represents only the initial analysis pipeline state; review and evidence
  progress are derived from child records and audit events. Keep
  `extractedTargetRoleTitle` as a session-level snapshot for history and
  workspace headers.
- `InputDocument`: career history or job posting input reference. Store kind,
  SHA-256 hash, language, token count, summary, and raw-storage consent
  reference. Use a unique constraint on `(analysisSessionId, kind)`.
- `RawPayload`: shared encrypted raw storage record for consented career
  history, job posting, or review answer text. Store source kind, one subject
  link, ciphertext, nonce/IV, auth tag, encryption key version, consent
  reference, status, creation timestamp, and cleared timestamp.
- `CareerProfile`: structured profile output from `parseProfile`, including
  experience, achievements, extracted skill evidence, summary, and schema
  version.
- `JobPosting` and `JobRequirement`: job-level structured output from
  `extractJobRequirements`. Store the role title on `JobPosting`; store each
  requirement as a row with normalized text, type, category, weight, priority,
  and source reference. Keep `JobPosting.roleTitle` separate from
  `AnalysisSession.extractedTargetRoleTitle`.
- `SkillTaxonomy`, `ProfileSkill`, and `RequirementSkill`: canonical skills,
  aliases, categories, parent relationships, and skill mentions from profile or
  requirement extraction.
- `MatchAnalysis`, `RequirementCoverage`, `EvidenceGap`, and `KeyFinding`:
  deterministic scoring results, per-requirement coverage, evidence gaps, and
  user-facing findings. Keep the scoring breakdown and explanation snapshot,
  but keep searchable coverage and gap fields normalized.
- `CareerPlan`, `PlanWeek`, and `PlanTask`: the 90-day plan. Store the plan as
  one parent record with 12 week rows, task rows, current week, status, and links
  back to requirements or evidence gaps where applicable. Keep
  `CareerPlan.targetRole` as the role label used when the plan was generated.
- `WeeklyReview`, `ReviewMessage`, `PlanAdjustment`, and `EvidenceUpdate`: the
  bounded review conversation, validated structured review result, deterministic
  plan updates, and evidence changes produced by the review flow.
- `EvidenceArtifact`: a reusable evidence material record shared by Plan,
  Review, and Evidence Builder. Store proof type, title, why it matters,
  evidence to create, next action, source, status, target week, and linked
  requirements/gaps. Do not store generated prose drafts as the primary
  artifact.
- `PipelineRun`, `PipelineStep`, `SchemaValidation`, `ProviderCall`,
  `AuditEvent`, and `OutboxEvent`: process trace, validation evidence, provider
  observability, append-only audit history, and retryable async work.

### Raw Text And Privacy Policy

- Store hashes, summaries, and structured derived fields by default.
- The first implementation includes opt-in encrypted raw storage.
- Store raw career history, raw job postings, or raw review answers only when
  the user has explicitly opted into raw storage for that submission.
- When raw storage is enabled, store encrypted payloads in the shared
  `RawPayload` table. Do not duplicate encrypted payload columns across
  business tables, and do not store plaintext raw input in normal business
  tables.
- Encrypted raw payloads must be deletable without deleting derived analysis
  records.
- Never expose raw input through Process Trace, AuditEvent, ProviderCall, logs,
  or screenshots. Use hashes, summaries, validation results, and structured
  output references instead.

### Availability And Expansion Rules

- Include `createdAt` and `updatedAt` on all major records. Include `deletedAt`
  on user-facing records that may need soft deletion.
- Include `schemaVersion` or equivalent version fields on LLM-derived outputs,
  scoring outputs, and plan state.
- Use idempotency keys on `AnalysisSession`, `PipelineRun`, and `OutboxEvent` so
  retries do not duplicate user-visible work.
- Keep `AuditEvent` append-only. Important state changes should create audit
  rows instead of mutating historical evidence.
- Use `OutboxEvent` for future background work such as reanalysis, provider
  retries, report generation, and artifact export.
- Use PostgreSQL `JSONB` for LLM output snapshots, scoring breakdowns, and
  flexible metadata. Normalize fields that are filtered, sorted, joined, or
  shown as primary UI rows, especially requirements, skills, coverage, weeks,
  reviews, evidence gaps, and audit events.
- Persist `JobPosting.roleTitle`, `AnalysisSession.extractedTargetRoleTitle`,
  and `CareerPlan.targetRole` separately, but derive a single target role label
  for normal workspace UI.
- Reject generic provider `confidence` fields. Allow confidence-like numeric
  signals only for adjacent-skill candidate diagnostics, and never as direct
  score input.

### Required Indexes And Constraints

- Index records by `userProfileId` and `createdAt` for session history.
- Index child records by `analysisSessionId`.
- Enforce one `InputDocument` per `(analysisSessionId, kind)`.
- Enforce one `PlanWeek` per `(careerPlanId, weekNumber)`.
- Enforce one `RawPayload` subject link per raw payload. Use a database check
  constraint if Prisma cannot express the rule directly.
- Enforce unique one-to-one raw payload links for `InputDocument` and
  `ReviewMessage` when present.
- Enforce important workflow link constraints in the database: `PlanTask` and
  `EvidenceArtifact` must each link to at least one requirement or evidence gap.
- Keep optional context links, such as `AnalysisSession.userProfileId` and
  `EvidenceGap.linkedRequirementId`, nullable and validate their meaning in the
  application layer.
- Use session-level cascade deletion for demo data. `RawPayload` must also be
  clearable independently without deleting derived analysis records.
- Use hard referential actions for requirement and evidence-gap links. Do not
  physically delete referenced requirements or gaps while workflow records
  depend on them.
- Index `PipelineStep` by `(pipelineRunId, stepName)` for Process Trace.
- Index `AuditEvent` by `(analysisSessionId, createdAt)` and by
  `(entityType, entityId)` for traceability.
- Index `OutboxEvent` by `(status, availableAt)` for retry workers.

## 9. Implementation Guardrails

- Real provider mode is preferred when configured, but mock fallback must
  complete the full flow without API keys.
- Keep all provider-specific code behind adapters.
- Use a hybrid API approach. Route Handlers own durable workflows, persistence,
  provider calls, and integration-testable API contracts. Server Actions are UI
  adapters only for form wrappers, redirects, and local UI transitions.
- Server Actions must call the same application services as Route Handlers and
  must not duplicate provider, persistence, scoring, or privacy logic.
- Keep scoring deterministic and testable.
- Keep Process Trace visible but visually secondary.
- Keep the first screen an app entry point, not a marketing page.
- Do not add account registration, billing, real job APIs, email, Slack, Notion,
  or production integrations in the first full-feature demo.
- Do not claim job placement, salary increase, hiring success, or definitive
  career diagnosis.
- Use generated sample data only. Do not include real client data or private
  personal information.

## 10. Testing And Acceptance Criteria

Minimum tests:

- scoring logic unit tests
- skill normalization and alias mapping tests
- Zod schema validation tests for LLM outputs
- fixture tests for the three sample roles
- mock provider tests for the main analysis flow
- review structuring and plan update tests
- evidence board derivation and status update tests
- raw-storage tests for default off, consent-based encrypted storage,
  decryption failure handling, and raw payload deletion
- idempotency tests for analysis and pipeline retries

Acceptance criteria:

- Full flow works through mock fallback without API keys.
- Analyze screen can render a complete score, coverage, skill map, evidence
  gaps, and next action.
- Plan screen renders 12 weekly cards.
- Review screen collects structured weekly review data from chat-like input.
- Evidence Builder renders evidence materials with proof type, linked gap or
  requirement, next action, target week, and status updates.
- Process Trace shows pipeline status, provider mode, embedding mode,
  validation status, scoring breakdown, and audit events.
- Raw career history, job posting, and review answers are not exposed in
  Process Trace, AuditEvent, ProviderCall, or logs.
- Build/check/test commands pass before the full demo is considered complete.

## 11. Source Documents

Use these files for detailed design context:

- `docs/system-design.md`: backend contracts, session lifecycle, pipeline,
  provider fallback, API draft, scoring boundaries, and privacy/security
  boundaries.
- `docs/schema-design.md`: planned Zod request, pipeline output, and
  privacy-safe API response contracts.
- `docs/skill-taxonomy-design.md`: skill taxonomy scope, seed size, alias
  policy, adjacent-skill policy, and pending normalization behavior.
- `docs/scoring-design.md`: deterministic score weights, evidence strength,
  adjacent skill contribution, plan readiness, and scoring test expectations.
- `docs/fixture-design.md`: synthetic sample persona, public demo fixture, and
  high/medium/low deterministic fixture cases.
- `docs/prisma-design.md`: planned Prisma persistence mapping, including the
  normalized table versus JSONB field split.
- `docs/ui-design.md`: UI flow, screen content, and interaction decisions.
- `DESIGN.md`: visual tone, color system, typography, layout, and components.
- `docs/project-overview.md`: original project context and product background.
  Use as background only.

When documents conflict, use this priority:

1. `docs/agent-development-guide.md`
2. `docs/system-design.md`
3. `docs/schema-design.md`
4. `docs/skill-taxonomy-design.md`
5. `docs/scoring-design.md`
6. `docs/fixture-design.md`
7. `docs/prisma-design.md`
8. `docs/ui-design.md`
9. `DESIGN.md`
10. `docs/project-overview.md`
