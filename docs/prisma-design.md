# キャリアけいかくん Prisma Design

Last updated: 2026-05-15

This document defines the planned Prisma persistence shape for キャリアけいかくん. It
is a design document, not a Prisma schema file.

Use this document after `docs/system-design.md` and `docs/schema-design.md`.
The system design defines behavior, the schema design defines validation
contracts, and this document defines which validated data becomes relational
tables versus JSONB snapshots.

## 1. Persistence Rule

Decision: use a hybrid relational + JSONB model.

Normalize data when it is:

- filtered, sorted, counted, or joined
- shown as a primary UI row
- updated independently by the user or a workflow
- linked from another feature
- part of access control, retry, audit, or trace behavior

Use Prisma `Json` / PostgreSQL JSONB when it is:

- a validated provider output snapshot
- nested explanation data displayed only inside its parent record
- flexible metadata for trace, audit, provider, or validation records
- a score breakdown or evaluation detail that should be versioned as a whole
- not independently edited or linked by the UI

When both forms exist, relational rows are the product source of truth for UI,
workflow, linking, and updates. JSONB fields are retained as validated snapshots
or detail payloads.

## 2. Adopted Technical Configuration

Decision: use a production-like but still demo-appropriate persistence design.

Adopted choices:

- Include `UserProfile` in the first Prisma schema as an optional future
  expansion point.
- Keep the public demo functional through `AnonymousVisitor -> AnalysisSession`
  without requiring profile setup.
- Store encrypted raw text in a shared `RawPayload` table, not as repeated
  encrypted columns on each business table.
- Keep product-facing workflow data normalized and keep provider/evaluation
  details in JSONB snapshots.
- Include `PipelineRun`, `PipelineStep`, `ProviderCall`, `SchemaValidation`,
  `AuditEvent`, and `OutboxEvent` from the first implementation.
- Use Prisma enums and unique indexes for core integrity.
- Use raw SQL migrations only for constraints Prisma cannot express cleanly,
  such as "exactly one raw payload subject must be set."

This design intentionally shows that the app treats AI work as a controlled
workflow with validation, audit, retry, fallback, privacy, and deletion
boundaries.

## 3. Normalize As Tables

### Identity And Session

Normalize:

- `AnonymousVisitor`
- `UserProfile`
- `AnalysisSession`
- `InputDocument`
- `RawPayload`

Reason:

- These records define ownership, session history, consent, and idempotency.
- They are needed for visitor-scoped reads and writes.

Notes:

- `UserProfile` is included from the first schema but remains optional. The
  public demo can work from `AnonymousVisitor -> AnalysisSession` alone.
- `AnalysisSession.userProfileId` should be nullable.
- `InputDocument` stores hashes, summaries, token counts, and consent state. It
  does not store encrypted payload columns directly.
- `RawPayload` stores encrypted raw payloads for input documents and weekly
  review messages when explicit consent exists.
- Plaintext raw input is never stored.

### Raw Payload

Normalize:

- `RawPayload`

Reason:

- Encrypted raw storage has one lifecycle, regardless of whether the source is a
  career history, job posting, or weekly review answer.
- Centralizing raw payloads makes key versioning, consent tracking, deletion,
  audit, and future reanalysis flows easier to reason about.
- Derived analysis data remains usable after raw payload deletion.

Recommended fields:

- `id`
- `analysisSessionId`
- `kind`
- `inputDocumentId`
- `reviewMessageId`
- `encryptedPayloadCiphertext`
- `encryptedPayloadNonce`
- `encryptedPayloadAuthTag`
- `encryptionKeyVersion`
- `consentReference`
- `status`
- `createdAt`
- `clearedAt`

Rules:

- `kind` should identify the raw source, for example `career_history`,
  `job_posting`, or `weekly_review_answer`.
- Exactly one subject link should be set:
  `inputDocumentId` or `reviewMessageId`.
- Subject links should be one-to-one where raw storage is enabled.
- Use a raw SQL check constraint for the exactly-one-subject rule if Prisma
  cannot express it directly.
- Clearing raw storage nulls encrypted payload fields, sets `status` to
  `cleared`, sets `clearedAt`, and creates an `AuditEvent` with no plaintext.

### Profile And Job Extraction

Normalize:

- `CareerProfile`
- `JobPosting`
- `JobRequirement`
- `SkillTaxonomy`
- `SkillAlias`
- `SkillAdjacencyRule`
- `ProfileSkill`
- `RequirementSkill`

Reason:

- `JobRequirement` is a first-class row in Analyze, Plan, and Evidence Builder.
- Skills need canonical names, aliases, categories, and profile/requirement
  links for the skill map.
- Alias and adjacency rules should be normalized so matching is explainable and
  testable.
- `CareerProfile` and `JobPosting` are parent records for extracted data and
  summaries.

JSONB inside these records:

- `CareerProfile.structuredExperienceJson`
- `CareerProfile.achievementsJson`
- optional `CareerProfile.extractedSkillsSnapshotJson`

Rule:

- Use `ProfileSkill` rows for the live skill map and matching logic.
- Use `SkillAlias` for deterministic alias matching.
- Use `SkillAdjacencyRule` plus optional embedding-assisted candidate discovery
  for adjacent-skill classification.
- Keep pending skill mentions in `ProfileSkill` and `RequirementSkill` with
  nullable canonical skill links.
- Use the JSONB fields for nested profile details and validated extraction
  snapshots that are not independently updated.
- Keep `JobPosting.roleTitle`, `AnalysisSession.extractedTargetRoleTitle`, and
  `CareerPlan.targetRole` as separate columns. They serve different persistence
  purposes even though the UI derives one display label.

### Match Analysis

Normalize:

- `MatchAnalysis`
- `RequirementCoverage`
- `EvidenceGap`
- `KeyFinding`

Reason:

- Requirement coverage, evidence gaps, and key findings are primary UI rows.
- Evidence gaps link into Plan and Evidence Builder.
- Coverage status and evidence strength are core scoring outputs.

JSONB inside these records:

- `MatchAnalysis.scoringBreakdownJson`
- `MatchAnalysis.explanationSnapshotJson`
- `RequirementCoverage.evidenceFromProfileJson`

Rule:

- Store `matchScore` as a normal column.
- Store detailed scoring components and explanation snapshots as JSONB.
- Store each coverage and gap as a row so they can be linked and counted.

### Plan

Normalize:

- `CareerPlan`
- `PlanWeek`
- `PlanTask`

Reason:

- The UI renders 12 week rows and task rows.
- Tasks change status through weekly review.
- Tasks link to requirements and evidence gaps.

JSONB inside these records:

- none required initially

Rule:

- Store week objective, review prompt, task title, evidence to create, links,
  status, and target week as normal columns.
- Avoid storing the whole 90-day plan as one JSON blob.

### Weekly Review

Normalize:

- `WeeklyReview`
- `ReviewMessage`
- `PlanAdjustment`
- `EvidenceUpdate`

Reason:

- Review history, plan adjustments, and evidence updates are independent events.
- Review output affects Plan and Evidence Builder.
- Review activity contributes to workspace progress and Process Trace.

JSONB inside these records:

- `WeeklyReview.summaryJson`
- `WeeklyReview.nextActionsJson`
- `ReviewMessage.metadataJson`
- `PlanAdjustment.changeSetJson`
- `EvidenceUpdate.metadataJson`

Rule:

- Store raw review text only as encrypted payload when explicit consent exists.
- Store summaries, next actions, and change sets as JSONB because they are
  displayed inside review history and applied by service logic, not edited as
  standalone UI rows.
- Store encrypted raw review text through `RawPayload`, not on `ReviewMessage`.

### Evidence Builder

Normalize:

- `EvidenceArtifact`
- `EvidenceUpdate`

Reason:

- Evidence materials are primary user-facing rows.
- Status, proof type, target week, source, linked requirement, and linked gap
  are filtered and updated.

JSONB inside these records:

- optional `EvidenceArtifact.metadataJson`
- `EvidenceUpdate.metadataJson`

Rule:

- Do not store generated resume bullets, README sections, or rewrite drafts as
  artifact payloads.
- Store material title, proof type, why it matters, evidence to create, next
  action, status, source, and links as normal columns.

### Process Trace And Operations

Normalize:

- `PipelineRun`
- `PipelineStep`
- `ProviderCall`
- `SchemaValidation`
- `AuditEvent`
- `OutboxEvent`

Reason:

- Process Trace needs ordered rows.
- Provider fallback, validation status, retry behavior, and audit history must
  be inspectable and testable.
- `AuditEvent` should be append-only.

JSONB inside these records:

- `PipelineStep.inputHashRefsJson`
- `PipelineStep.summaryJson`
- `ProviderCall.requestMetadataJson`
- `ProviderCall.responseMetadataJson`
- `SchemaValidation.errorDetailsJson`
- `AuditEvent.metadataJson`
- `OutboxEvent.payloadJson`

Rule:

- Never store raw prompts, raw completions, stack traces, or raw user input in
  trace metadata.
- `ProviderCall` stores provider name, status, timing, token counts, model name,
  fallback reason, and redacted metadata only.

## 4. JSONB Field Classification

Use JSONB for these planned fields:

- `CareerProfile.structuredExperienceJson`
- `CareerProfile.achievementsJson`
- `CareerProfile.extractedSkillsSnapshotJson`
- `MatchAnalysis.scoringBreakdownJson`
- `MatchAnalysis.explanationSnapshotJson`
- `RequirementCoverage.evidenceFromProfileJson`
- `WeeklyReview.summaryJson`
- `WeeklyReview.nextActionsJson`
- `ReviewMessage.metadataJson`
- `PlanAdjustment.changeSetJson`
- `EvidenceUpdate.metadataJson`
- `PipelineStep.inputHashRefsJson`
- `PipelineStep.summaryJson`
- `ProviderCall.requestMetadataJson`
- `ProviderCall.responseMetadataJson`
- `SchemaValidation.errorDetailsJson`
- `AuditEvent.metadataJson`
- `OutboxEvent.payloadJson`

Do not use JSONB for:

- job requirements
- requirement coverage rows
- evidence gaps
- plan weeks
- plan tasks
- evidence materials
- pipeline steps
- audit events
- status fields
- ownership fields
- consent fields
- encrypted payload columns

## 5. Important Constraints And Indexes

Adopt these constraints first:

- `InputDocument(analysisSessionId, kind)` is unique.
- `PlanWeek(careerPlanId, weekNumber)` is unique.
- `AnalysisSession(anonymousVisitorId, idempotencyKey)` is unique when
  `idempotencyKey` is present.
- `PipelineStep(pipelineRunId, stepName, attemptNumber)` is unique.
- `RawPayload.inputDocumentId` is unique when present.
- `RawPayload.reviewMessageId` is unique when present.
- `RawPayload` has a database check constraint so exactly one subject link is
  present.
- `PlanTask` has a database check constraint so at least one of
  `linkedRequirementId` or `linkedEvidenceGapId` is present.
- `EvidenceArtifact` has a database check constraint so at least one of
  `sourceRequirementId` or `sourceEvidenceGapId` is present.

Keep these nullable-link rules in application validation:

- `AnalysisSession.userProfileId` is nullable because profile setup is optional.
- `EvidenceGap.linkedRequirementId` is nullable because some gaps can represent
  cross-cutting portfolio or evidence weaknesses rather than one exact
  requirement.
- Additional optional explanatory links should stay in service-level validation
  unless they protect raw storage, core workflow linking, or trace integrity.

Adopt these indexes first:

- `AnalysisSession(anonymousVisitorId, createdAt)`
- `AnalysisSession(userProfileId, createdAt)`
- every major child table by `analysisSessionId`
- `JobRequirement(jobPostingId)`
- `SkillAlias(normalizedAlias, locale)` should be unique when locale is present.
- `SkillTaxonomy(category, canonicalName)`
- `ProfileSkill(analysisSessionId, category)`
- `RequirementSkill(jobRequirementId, category)`
- `RequirementCoverage(matchAnalysisId)`
- `RequirementCoverage(jobRequirementId)`
- `EvidenceGap(analysisSessionId, linkedRequirementId)`
- `PlanTask(linkedRequirementId)`
- `PlanTask(linkedEvidenceGapId)`
- `EvidenceArtifact(analysisSessionId, status)`
- `PipelineStep(pipelineRunId, stepName)`
- `AuditEvent(analysisSessionId, createdAt)`
- `AuditEvent(entityType, entityId)`
- `OutboxEvent(status, availableAt)`
- `RawPayload(analysisSessionId, kind, status)`

## 6. Delete Policy And Referential Actions

Decision: use session-level cascade for demo data, individual raw payload
clearing for privacy, and hard referential actions for core workflow links.

### Delete Policy

- `AnonymousVisitor` deletion cascades to its `AnalysisSession` records and
  their child records.
- `AnalysisSession` deletion cascades to Analyze, Plan, Review, Evidence
  Builder, Process Trace, Audit, Outbox, and RawPayload records.
- `RawPayload` can be cleared without deleting the session. Clearing sets
  encrypted payload fields to null, sets `status` to `cleared`, sets
  `clearedAt`, and writes an `AuditEvent` without plaintext.
- Individual physical deletion of requirements, gaps, plan tasks, evidence
  materials, trace rows, or audit rows should not be exposed as normal product
  behavior.
- User-facing records that need to disappear from the UI should use status or
  `deletedAt` rather than physical deletion.
- `AuditEvent` remains append-only while the session exists, then cascades when
  the session itself is deleted.

### Referential Actions

Use these defaults:

- `AnonymousVisitor -> AnalysisSession`: `Cascade`
- `AnonymousVisitor -> UserProfile`: `Cascade`
- `UserProfile -> AnalysisSession`: `SetNull`
- `AnalysisSession -> child records`: `Cascade`
- `CareerPlan -> PlanWeek -> PlanTask`: `Cascade`
- `PipelineRun -> PipelineStep`: `Cascade`
- `AnalysisSession -> PipelineRun`, `ProviderCall`, `SchemaValidation`,
  `AuditEvent`, `OutboxEvent`: `Cascade`
- `InputDocument` and `ReviewMessage` subject links from `RawPayload`:
  `Restrict` for individual subject deletion; session-level deletion removes raw
  payloads with the rest of the session.
- Requirement and gap links from `RequirementCoverage`, `PlanTask`, and
  `EvidenceArtifact`: `Restrict`
- Optional explanatory links, such as `EvidenceGap.linkedRequirementId`: nullable
  but `Restrict` when present.

The hard-link policy means referenced requirements and gaps cannot be physically
deleted while downstream workflow records depend on them. Use status changes,
soft deletion, or session deletion instead.

## 7. Resolved Classification From Current Discussion

| Area | Normalize | JSONB |
| --- | --- | --- |
| Career profile | `CareerProfile`, `ProfileSkill` | structured experience, achievements, skill extraction snapshot |
| Job posting | `JobPosting`, `JobRequirement`, `RequirementSkill` | none required initially |
| Skill map | `SkillTaxonomy`, `SkillAlias`, `SkillAdjacencyRule`, `ProfileSkill`, `RequirementSkill` | optional alias/debug snapshot only |
| Match analysis | `MatchAnalysis`, `RequirementCoverage`, `EvidenceGap`, `KeyFinding` | scoring breakdown, explanation snapshot, evidence references |
| Plan | `CareerPlan`, `PlanWeek`, `PlanTask` | none required initially |
| Review | `WeeklyReview`, `ReviewMessage`, `PlanAdjustment`, `EvidenceUpdate` | summaries, next actions, change sets, metadata |
| Evidence Builder | `EvidenceArtifact`, `EvidenceUpdate` | optional metadata only |
| Raw storage | `RawPayload` | none |
| Process Trace | `PipelineRun`, `PipelineStep`, `ProviderCall`, `SchemaValidation`, `AuditEvent`, `OutboxEvent` | redacted metadata, hash refs, validation details, outbox payload |

## 8. Remaining Prisma Questions

The normalized-vs-JSONB classification, optional `UserProfile`, shared
`RawPayload`, trace/audit/outbox inclusion, first-pass integrity strategy,
nullable-link constraint policy, delete policy, and hard referential action
policy are resolved. The next Prisma question is:

- Whether any additional query-specific indexes are needed after the first
  screen/API design pass.
