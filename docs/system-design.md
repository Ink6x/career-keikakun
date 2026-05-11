# キャリアけいかくん System Design

Last updated: 2026-05-15

This document is the working system design for the full キャリアけいかくん demo. It is
intentionally more detailed than the product and UI docs because it defines the
contracts that implementation, tests, and future architecture notes should
follow.

Use this as the primary place to discuss and settle backend behavior. Use
`docs/schema-design.md` for the concrete planned Zod request, pipeline output,
and API response contracts. Use `docs/scoring-design.md` for deterministic
match scoring. Use `docs/prisma-design.md` for the planned persistence mapping.
When this document conflicts with earlier overview notes, prefer this document
and `docs/agent-development-guide.md`.

## 1. Current Decisions

- Build the full public demo in the first implementation: Analyze, Plan, Review,
  Interview Studio, Evidence Builder, Process Trace, README, tests, and CI.
- Use anonymous sessions. Do not require account registration.
- Use real provider execution first when configured, then deterministic mock
  fallback when the provider is unavailable, unconfigured, or fails validation.
- Store derived structured data by default. The first implementation includes
  opt-in encrypted raw storage for career history, job posting, review answers,
  and interview answers when the user explicitly consents.
- Keep scoring, state transitions, schema validation, audit events, and privacy
  filtering deterministic and testable.
- Keep LLM responsibilities limited to semantic extraction, plan/question
  drafting, summarization, and interview feedback. Evidence Builder does not use
  LLM prose generation in the first design.

## 2. System Boundary

### In Scope

- Anonymous visitor/session identity.
- Analysis session lifecycle.
- Real-first provider adapter with mock fallback.
- Local embedding/similarity fallback.
- Structured LLM output validation with Zod.
- Deterministic skill normalization and match scoring.
- 12-week plan generation and deterministic plan updates.
- Weekly review workflow.
- Interview question generation and answer evaluation.
- Evidence material derivation and status tracking.
- Process Trace and append-only audit events.
- Privacy-safe persistence using hashes, summaries, structured outputs, and
  opt-in encrypted raw payloads.

### Out Of Scope

- Account registration and full authentication.
- Billing.
- Real job-board APIs.
- Email sending.
- Slack, Notion, LINE, Discord, or other external workflow integrations.
- Production-grade queue workers as visible product features.
- Claims of hiring, salary, or career outcome guarantees.

## 3. Main Architecture

```text
Browser
  -> Next.js App Router UI
  -> Route Handlers for workflows
  -> Server Actions as UI adapters
  -> Application Services
       - AnalysisService
       - ReviewService
       - InterviewService
       - EvidenceService
       - TraceService
  -> Domain Modules
       - schemas
       - providers
       - skill taxonomy
       - scoring engine
       - privacy utilities
       - audit logger
  -> Prisma Repository Layer
  -> PostgreSQL
```

Provider calls must never be made directly from UI components. All provider
usage goes through the provider adapter and schema validation layer.

## 4. Anonymous Session Model

### Identity

The app creates or reuses an `AnonymousVisitor` for the browser. The visitor ID
is stored in an httpOnly, SameSite cookie and is used only to associate demo
analysis sessions with the same browser.

Recommended default:

- Cookie name: `keikakun_visitor`
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Secure` in production
- No localStorage token for identity
- No required email, password, OAuth, or profile setup

### Ownership Rule

Every user-visible record must be reachable from either:

- `AnonymousVisitor -> AnalysisSession -> child records`, or
- `AnonymousVisitor -> UserProfile -> AnalysisSession`

APIs must reject access to sessions that do not belong to the current anonymous
visitor.

## 5. AnalysisSession Lifecycle

`AnalysisSession` is the central unit of work. New analysis runs create new
sessions instead of overwriting old ones.

### Session Status

Decision: `AnalysisSession.status` only represents the initial analysis pipeline
state. Post-completion activity such as Review, Interview Studio, and Evidence
Builder must be tracked on child records and `AuditEvent`, not by mutating the
session status into activity-specific values.

```text
draft
  -> validating_input
  -> running
  -> provider_fallback
  -> completed

running
  -> validation_error
  -> failed
```

Recommended enum:

- `draft`: input has been accepted but pipeline has not started.
- `validating_input`: server-side input checks are running.
- `running`: analysis pipeline is executing.
- `provider_fallback`: real provider failed or was unavailable, mock fallback is
  being used.
- `completed`: Analyze, Plan, Interview questions, Evidence material records,
  and Trace are available.
- `validation_error`: input or provider output failed schema validation and no
  usable fallback completed.
- `failed`: unexpected non-validation failure.

Post-completion activity is derived from child records:

- `WeeklyReview` and `PlanAdjustment` indicate review progress.
- `InterviewAnswer` and `InterviewEvaluation` indicate interview progress.
- `EvidenceArtifact` and `EvidenceUpdate` indicate evidence material progress.
- `AuditEvent` records the append-only history of all important updates.

API responses may expose a derived `workspaceProgress` summary for UI
convenience, but it should be computed from child records rather than stored as
the source of truth.

Recommended derived shape:

```ts
workspaceProgress: {
  reviewCount: number
  evaluatedAnswerCount: number
  evidenceMaterialCount: number
  readyEvidenceCount: number
  lastActivityAt: string | null
}
```

## 6. Pipeline Contract

The initial analysis pipeline runs in this order:

```text
createAnalysisSession
validateInput
parseProfile
extractJobRequirements
normalizeSkills
scoreMatch
generatePlan
generateInterviewSet
buildEvidenceBoard
recordAuditEvent
```

Each step records a `PipelineStep` with:

- `stepName`
- `status`
- `providerMode`
- `embeddingMode`
- `startedAt`
- `completedAt`
- `inputHashRefs`
- `schemaValidationId`
- `summary`
- `errorCode`

Do not record raw input, raw prompt text, raw provider completion text, or raw
answer text in `PipelineStep`.

### Step Status

Recommended enum:

- `pending`
- `running`
- `success`
- `fallback`
- `validation_error`
- `failed`
- `skipped`

### Provider Fallback Rule

For provider-backed steps:

1. Try the selected real provider when configured.
2. Validate the provider output with the step's Zod schema.
3. If provider call or validation fails, record a `ProviderCall` and
   `PipelineStep` fallback event.
4. Run deterministic mock output for the same step.
5. Validate mock output.
6. Continue only if mock output passes validation.

### Provider Visibility

Decision: the workspace shows only a compact provider mode value. Failure reason,
provider response status, schema validation details, and fallback reason codes
belong in Process Trace.

Workspace context should show:

```text
providerMode: real | fallback | mock
```

Recommended Japanese UI labels:

- `実行モード: Real`
- `実行モード: Fallback`
- `実行モード: Mock`

Process Trace should show:

- selected provider
- provider call status
- schema validation status
- fallback provider
- fallback validation status
- reason code, for example `provider_validation_failed`

Do not show raw prompts, raw completions, stack traces, or raw user input in
either workspace metadata or Process Trace.

## 7. Pipeline Step I/O

### `parseProfile`

Input:

- `careerHistoryHash`
- career history text in memory only
- locale
- schema version

Output:

- `CareerProfile`
- extracted profile skills
- interview-ready examples
- input summary

Trace-safe output:

- hash
- token count
- summary
- validation result
- provider mode

### `extractJobRequirements`

Input:

- `jobPostingHash`
- job posting text in memory only
- locale
- schema version

Output:

- `JobPosting`
- `JobRequirement[]`
- role title
- responsibilities and outcomes snapshot

Trace-safe output:

- hash
- role title
- requirement count
- validation result

### `normalizeSkills`

Input:

- profile skill mentions
- requirement skill mentions
- skill taxonomy

Output:

- canonical skills
- aliases used
- matched, adjacent, and missing skill groups

Trace-safe output:

- canonical skill names
- category counts
- alias hit counts

### `scoreMatch`

Input:

- `CareerProfile`
- `JobRequirement[]`
- normalized skills
- evidence candidates

Output:

- `MatchAnalysis`
- `RequirementCoverage[]`
- `EvidenceGap[]`
- `KeyFinding[]`

Trace-safe output:

- scoring breakdown
- coverage counts
- score version

### `generatePlan`

Input:

- match analysis
- requirement coverage
- evidence gaps
- target role

Output:

- `CareerPlan`
- 12 `PlanWeek` records
- `PlanTask[]`

Trace-safe output:

- week count
- task count
- linked gap count
- validation result

### `generateInterviewSet`

Decision: initial analysis generates exactly 6 interview questions.

Category distribution:

- `behavioral`: 2
- `role_skill`: 2
- `gap`: 1
- `portfolio_evidence`: 1

Input:

- target role
- job requirements
- evidence gaps
- interview-ready examples
- plan priorities

Output:

- `InterviewQuestion[]`

Rules:

- Each question must have a fixed category enum.
- Each question should link to either a `JobRequirement` or an `EvidenceGap`
  when possible.
- At least one question must link to an `EvidenceGap`.
- At least one question must ask about portfolio or evidence creation.
- Avoid over-concentrating questions on one requirement.
- Additional questions may be generated later, but the initial set remains 6.

Trace-safe output:

- question count
- category counts
- linked gap count

### `buildEvidenceBoard`

Decision: Evidence Builder is an evidence material board, not a text generation
surface. Initial analysis creates structured evidence material records from
evidence gaps and plan tasks. It does not generate resume bullets, README
sections, interview stories, or other prose drafts.

Input:

- match analysis
- evidence gaps
- plan tasks
- interview examples

Output:

- `EvidenceArtifact[]`

Record meaning:

- `EvidenceArtifact` is an internal model name.
- User-facing UI should call these records `証拠素材`, `応募素材`, or
  `ポートフォリオ素材` depending on context.
- The record represents something the user should create, collect, or improve,
  not generated prose.

Required fields:

- title
- proof type
- linked requirement or evidence gap
- why it matters
- evidence to create
- next action
- suggested source, for example plan, review, or interview
- status: `not_started`, `in_progress`, `ready`, or `archived`
- target week when available

Rules:

- Create initial evidence material records from the highest-priority evidence
  gaps and related plan tasks.
- Review and Interview activity may update status, add notes, or create
  additional evidence material records.
- Do not create generated text drafts.
- Do not provide resume/README/interview-story rewrite actions in the first
  design.

Trace-safe output:

- evidence material count
- proof type counts
- linked requirement/gap count

## 8. Review, Interview, And Evidence Updates

### Review Update Flow

```text
collectReviewConversation
structureWeeklyReview
updatePlanState
createEvidenceUpdates
recordAuditEvent
```

Review answers are treated as raw user input. Store only structured summary,
hashes, and encrypted raw payload when explicit consent exists.

### Interview Evaluation Flow

```text
selectQuestion
submitAnswer
hashAndSummarizeAnswer
evaluateInterviewAnswer
linkInterviewEvaluationToEvidence
recordAuditEvent
```

Interview answers are not shown in Process Trace. Process Trace may show answer
hash, question ID, evaluation status, and linked evidence material IDs.

### Evidence Board Update Flow

```text
selectArtifact
updateEvidenceStatus
attachEvidenceNote
recordAuditEvent
```

Evidence Builder updates material status and notes. It does not generate or
refine prose drafts.

## 9. Scoring Design

The match score is deterministic and must not be delegated to an LLM.

Decision: final score is 100 points with these weights:

```text
required coverage:        45
preferred coverage:       15
evidence strength:        25
adjacent skill support:   10
plan readiness:            5
```

Detailed scoring rules are defined in `docs/scoring-design.md`.

### Requirement Coverage

- Required requirements have higher weight than preferred requirements.
- `matched`: clear profile evidence or normalized skill match exists.
- `partial`: adjacent skill, related achievement, or weak evidence exists.
- `missing`: no reliable profile evidence or adjacent skill exists.

Recommended status scores:

- `matched`: 1.0
- `partial`: 0.5
- `missing`: 0.0

### Evidence Strength

Evidence strength measures whether the user can prove the match, not just claim
the skill.

Signals:

- achievement with measurable outcome
- project or artifact reference
- decision-making example
- repeated use across roles
- interview-ready story

Decision: unverifiable but plausible claims should be penalized aggressively.
They usually count as `weak`, not `moderate`, unless there is supporting
context.

### Skill Proximity

Decision: embeddings and local similarity are used only to classify adjacent
skills. Embedding cosine similarity must not be inserted directly into
`finalScore`.

Skill proximity uses deterministic taxonomy, alias mapping, and adjacency
classification. Embeddings may suggest adjacency candidates, but the final skill
proximity value is produced by deterministic rules over exact, alias, category,
and accepted-adjacent matches.

Taxonomy decision:

- Scope is technical, product, business, and collaboration skills.
- Structure is top-level category plus canonical skill.
- Initial seed target is 80 to 120 canonical skills.
- Unknown skill mentions are retained as pending normalization records instead
  of being discarded.
- Detailed taxonomy and alias policy is defined in
  `docs/skill-taxonomy-design.md`.

Confidence decision:

- Generic provider `confidence` fields are not accepted in business output.
- Confidence-like values are allowed only for adjacent-skill candidate support,
  such as `adjacencyScore` or `similarityScore`.
- Adjacent candidate scores are diagnostics only and do not directly contribute
  to final scoring.

Signals:

- exact canonical skill match
- alias match
- same category adjacent skill
- business-domain adjacency

Process Trace should expose:

- `embeddingMode`: `local`, `provider`, or `disabled`
- `similarityUse`: `adjacency_classification`
- `directScoreContribution`: `none`
- adjacent skill candidates accepted or rejected by deterministic rules
- `scoreVersion`
- `weightVersion`
- scoring breakdown by component

### Role Title Display

Decision: persist role title fields separately, but show one target role label
in normal workspace UI.

- `JobPosting.roleTitle`: extracted from the job posting.
- `AnalysisSession.extractedTargetRoleTitle`: session-level snapshot for
  history, workspace header, and trace-safe summaries.
- `CareerPlan.targetRole`: the role name used when the 12-week plan was
  generated.

Normal UI should derive one display label in this order:

1. `AnalysisSession.extractedTargetRoleTitle`
2. `JobPosting.roleTitle`
3. `CareerPlan.targetRole`

Process Trace may show the source used for the display label, but the workspace
should not present three competing role titles.

## 10. API Contract Draft

Decision: use a hybrid approach.

Route Handlers own durable business workflows:

- persistence
- provider calls
- pipeline execution
- review submission
- interview answer evaluation
- evidence material updates
- Process Trace reads
- API-style integration tests

Server Actions are allowed only as UI adapters:

- form submission wrappers
- redirects after successful mutations
- UI-local transitions
- search param or route updates

Server Actions must call the same application services as Route Handlers. They
must not contain separate provider logic, persistence rules, scoring logic, or
privacy filtering.

The resource-oriented route contracts are:

### Create Analysis

`POST /api/analysis-sessions`

Request:

- `careerHistory`
- `jobPosting`
- `source`: `sample` or `manual`
- `rawStorageConsent`: boolean
- `idempotencyKey`

Response:

- `analysisSessionId`
- `status`
- `providerMode`
- `rawStorageStored`: boolean
- `redirectTo`

### Get Session

`GET /api/analysis-sessions/:id`

Response:

- session summary
- target role
- provider mode
- analysis timestamp
- available workspace sections

### Get Analyze Result

`GET /api/analysis-sessions/:id/analyze`

Response:

- score summary
- key findings
- requirement coverage
- skill map
- evidence gaps
- next action

### Get Plan

`GET /api/analysis-sessions/:id/plan`

Response:

- plan summary
- 12 plan weeks
- plan tasks
- current week
- linked evidence materials

### Submit Review

`POST /api/analysis-sessions/:id/reviews`

Request:

- `weekNumber`
- review answers or guided message payload
- `rawStorageConsent`

Response:

- structured review
- updated plan state
- evidence updates
- `rawStorageStored`: boolean
- audit event reference

### Get Interview Studio

`GET /api/analysis-sessions/:id/interview`

Response:

- generated questions
- answered question summaries
- evaluations

### Evaluate Interview Answer

`POST /api/analysis-sessions/:id/interview-answers`

Request:

- `interviewQuestionId`
- `answer`
- `rawStorageConsent`

Response:

- evaluation
- improved outline
- linked evidence material updates
- `rawStorageStored`: boolean

### Get Evidence Board

`GET /api/analysis-sessions/:id/evidence`

Response:

- evidence material list
- filters
- status counts
- linked requirements and gaps

### Update Evidence Material

`PATCH /api/analysis-sessions/:id/evidence-materials/:materialId`

Request:

- status
- note
- next action

Response:

- updated evidence material
- status
- audit event reference

### Get Process Trace

`GET /api/analysis-sessions/:id/trace`

Response:

- pipeline run summary
- pipeline steps
- provider calls without raw prompts/completions
- schema validations
- scoring breakdown
- audit events

## 11. Error Contract

Use HTTP status codes semantically and a consistent error envelope.

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "careerHistory",
        "message": "Career history is too short.",
        "code": "too_small"
      }
    ]
  }
}
```

Recommended codes:

- `validation_error`
- `not_found`
- `forbidden`
- `session_conflict`
- `provider_unavailable`
- `provider_validation_failed`
- `raw_storage_encryption_failed`
- `raw_storage_decryption_failed`
- `rate_limited`
- `internal_error`

Do not expose stack traces, SQL errors, raw provider errors, raw prompt text, or
raw user input in API responses.

## 12. Privacy And Security Rules

- Secrets only come from environment variables.
- Do not commit `.env`.
- Validate all user input with Zod before processing.
- Use Prisma parameterized queries. Do not concatenate SQL.
- Store visitor identity in httpOnly cookies, not localStorage.
- Enforce visitor ownership on every session-scoped read/write.
- Do not render user-provided HTML.
- Add rate limiting for expensive provider-backed actions.
- Redact raw input from logs, errors, Process Trace, ProviderCall, AuditEvent,
  screenshots, and README examples.
- Store encrypted raw payloads only when explicit consent exists.

### Encrypted Raw Storage

Decision: encrypted raw storage is part of the first implementation, but it is
always opt-in and off by default.

Raw storage exists only to support reanalysis, editing, and clearer portfolio
demonstration of privacy-aware design. It must not become the normal source of
truth for the product.

Consent rules:

- `rawStorageConsent` defaults to `false` for every user-submitted payload.
- Consent must be captured per analysis or per submitted answer, not assumed
  globally.
- If `rawStorageConsent` is false, raw text is used in memory for the current
  request and discarded after derived outputs are created.
- If `rawStorageConsent` is true, store the encrypted payload in the shared
  `RawPayload` table.
- Consent state is recorded as a reference such as `analysis:{sessionId}` or
  `interview-answer:{answerId}`.

Encryption rules:

- Use authenticated encryption such as AES-256-GCM.
- Load encryption material from environment variables only.
- Track `encryptionKeyVersion` on every encrypted payload.
- Store nonce/IV and auth tag separately unless the implementation stores auth
  tag inside the ciphertext format.
- Never store plaintext raw payload in normal business tables.

Recommended `RawPayload` fields:

```text
id
analysisSessionId
kind
inputDocumentId
reviewMessageId
interviewAnswerId
encryptedPayloadCiphertext
encryptedPayloadNonce
encryptedPayloadAuthTag
encryptionKeyVersion
consentReference
status
createdAt
clearedAt
```

Exactly one subject link should be set for each `RawPayload`: `inputDocumentId`,
`reviewMessageId`, or `interviewAnswerId`.

Read/decrypt rules:

- Decrypt only for explicit reanalysis or editing flows.
- Never decrypt for Process Trace, AuditEvent, ProviderCall, logs, screenshots,
  analytics, or README examples.
- Treat decryption failure as a recoverable error. Derived structured data should
  remain usable even when encrypted raw payloads cannot be read.

Deletion rules:

- Encrypted raw payloads must be deletable without deleting the derived analysis
  session.
- Clearing raw storage should null encrypted payload fields on `RawPayload`, set
  `status` to `cleared`, set `clearedAt`, and record an `AuditEvent` with no
  plaintext.
- Whole-session deletion is allowed for demo data and should cascade from
  `AnalysisSession` to derived analysis, plan, review, interview, evidence,
  trace, audit, outbox, and raw payload records.

## 13. Open Design Questions

The current system design questions in this document are resolved. New questions
should be added here as they come up during schema, fixture, or implementation
planning.
