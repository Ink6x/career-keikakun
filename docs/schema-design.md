# キャリアけいかくん Schema Design

Last updated: 2026-05-15

This document defines the planned Zod schema contracts for キャリアけいかくん. It is a
design document, not implementation code.

Use this document together with `docs/system-design.md`. The system design
defines behavior and boundaries; this document defines the concrete data shapes
that implementation and tests should validate.

## 1. Scope

The schema layer has four responsibilities:

- Validate user/API request payloads before any workflow runs.
- Validate provider-backed structured outputs before persistence.
- Validate deterministic pipeline outputs so mock and real execution share the
  same contract.
- Shape privacy-safe API responses for the workspace UI.

The schema layer must not become the business logic layer. Scoring, ownership
checks, state transitions, encryption, audit logging, and persistence remain in
application services and repositories.

## 2. Contract Principles

- All provider-backed outputs are strict schemas. Unknown fields should fail
  validation instead of being silently accepted.
- Mock fallback outputs use the same schemas as real provider outputs.
- Provider outputs must not contain database IDs. Application code assigns
  durable IDs after validation.
- Provider outputs may use temporary keys such as `requirementKey`, `skillKey`,
  `gapKey`, `weekKey`, or `questionKey` for linking within one pipeline run.
- Raw career history, raw job posting text, raw review answers, raw interview
  answers, raw prompts, and raw provider completions are never valid fields in
  trace, audit, provider-call, or workspace response schemas.
- Every LLM-derived or provider-derived payload includes `schemaVersion`.
- API response schemas expose user-facing state, not raw database rows.
- API request schemas should be strict at the top level and return field-level
  validation errors.

Recommended initial `schemaVersion`:

```text
2026-05-15
```

Default locale:

```text
ja-JP
```

## 3. Common Primitives

### Server-Owned Fields

The following fields are server-owned and must not be accepted from provider
outputs:

- database `id`
- `anonymousVisitorId`
- `analysisSessionId`
- `createdAt`
- `updatedAt`
- `startedAt`
- `completedAt`
- encrypted payload fields
- audit event IDs

### Text Limits

Initial request limits:

- `careerHistoryText`: 200 to 30,000 characters
- `jobPostingText`: 200 to 30,000 characters
- `weeklyReviewText`: 20 to 4,000 characters
- `interviewAnswerText`: 20 to 8,000 characters
- `note`: 0 to 2,000 characters
- `summary`: 1 to 600 characters
- short labels such as titles and role names: 1 to 120 characters

These limits are product defaults, not security boundaries. Server-side body
size limits and rate limits are still required.

### Scores And Weights

- Percent-like scores use integers from 0 to 100.
- Confidence-like adjacent-skill diagnostics and similarity values use decimals
  from 0 to 1.
- Requirement priority uses integers from 1 to 5.
- Requirement weight uses decimals from 0 to 1 after deterministic
  normalization.

Provider output may suggest priority, but final scoring weights are assigned by
deterministic logic.

### Role Title Fields

Decision: keep role title fields separate in persistence, but expose one primary
display label in the workspace UI.

Field responsibilities:

- `JobPosting.roleTitle`: the role title extracted from the job posting.
- `AnalysisSession.extractedTargetRoleTitle`: session-level snapshot used for
  session history, workspace headers, and trace-safe summaries.
- `CareerPlan.targetRole`: the target role name used when the 12-week plan was
  generated.

Rules:

- Do not collapse these fields into one database column.
- Workspace UI should show a single target role label, derived first from
  `AnalysisSession.extractedTargetRoleTitle`, then `JobPosting.roleTitle`, then
  `CareerPlan.targetRole`.
- Process Trace may show which source field produced the display label.
- Do not show all three role title variants as separate normal UI fields.

### Confidence Fields

Decision: provider outputs should not include broad self-reported confidence
fields.

Rules:

- Generic `confidence` fields are not valid in provider business outputs.
- Confidence-like values are allowed only for adjacent-skill candidate support,
  such as `adjacencyScore` or `similarityScore`.
- Adjacent candidate scores are diagnostic signals, not final scoring inputs.
- Final scoring uses deterministic `matched`, `adjacent`, `missing`, and
  `pending` relationships, not provider confidence.

## 4. Common Enums

### Execution

```text
ProviderMode = real | fallback | mock
EmbeddingMode = local | provider | disabled
AnalysisSessionStatus =
  draft | validating_input | running | provider_fallback |
  completed | validation_error | failed
PipelineStepStatus =
  pending | running | success | fallback |
  validation_error | failed | skipped
ValidationStatus = passed | failed
RawPayloadStatus = active | cleared | failed
RawPayloadKind =
  career_history | job_posting |
  weekly_review_answer | interview_answer
```

### Pipeline Steps

```text
PipelineStepName =
  createAnalysisSession |
  validateInput |
  parseProfile |
  extractJobRequirements |
  normalizeSkills |
  scoreMatch |
  generatePlan |
  generateInterviewSet |
  buildEvidenceBoard |
  recordAuditEvent
```

### Requirements And Skills

```text
RequirementType = required | preferred
RequirementCategory =
  engineering | ai | data | product | design |
  cloud | devops | collaboration | leadership |
  domain | language | process | other
SkillCategory =
  frontend | backend | ai | data | cloud | devops |
  product | business | design | collaboration | language | other
SkillRelationship = matched | adjacent | missing | pending
CoverageStatus = matched | partial | missing
EvidenceStrength = strong | moderate | weak | none
```

### Planning And Evidence

```text
PlanStatus = active | completed | archived
PlanWeekStatus = not_started | in_progress | completed | skipped
PlanTaskStatus = not_started | in_progress | completed | skipped
Difficulty = low | medium | high
Impact = low | medium | high
EvidenceProofType =
  case_study | measurable_result | work_sample |
  project_demo | process_document | technical_note |
  interview_example
EvidenceMaterialStatus = not_started | in_progress | ready | archived
EvidenceSource = analysis | plan | review | interview
```

### Interview And Review

```text
InterviewQuestionCategory =
  behavioral | role_skill | gap | portfolio_evidence
ReviewProgressStatus = on_track | blocked | adjusted
```

## 5. Request Schemas

### `StartAnalysisRequest`

Purpose: validate the initial Analyze form.

Fields:

- `careerHistoryText`
- `jobPostingText`
- `rawStorageConsent`
- `locale`
- `idempotencyKey`

Rules:

- `careerHistoryText` and `jobPostingText` are required.
- `rawStorageConsent` defaults to false.
- `locale` defaults to `ja-JP`.
- `idempotencyKey` is accepted from the client only as an opaque string and is
  scoped to the current anonymous visitor.

### `SubmitWeeklyReviewRequest`

Purpose: capture weekly review input and optional raw answer consent.

Fields:

- `analysisSessionId`
- `careerPlanId`
- `weekNumber`
- `weeklyReviewText`
- `rawStorageConsent`

Rules:

- `weekNumber` must be 1 through 12.
- The session must belong to the current anonymous visitor.
- Raw text may be encrypted only when consent is true.

### `SubmitInterviewAnswerRequest`

Purpose: evaluate one answer in Interview Studio.

Fields:

- `analysisSessionId`
- `interviewQuestionId`
- `interviewAnswerText`
- `rawStorageConsent`

Rules:

- The question must belong to the session.
- Store `answerHash` and `answerSummary` by default.
- Store encrypted raw answer text in `RawPayload` only when consent is true.

### `UpdateEvidenceMaterialRequest`

Purpose: update the status and notes for one evidence material.

Fields:

- `analysisSessionId`
- `evidenceArtifactId`
- `status`
- `note`
- `nextAction`

Rules:

- `status` must use `EvidenceMaterialStatus`.
- The material must belong to the current anonymous visitor's session.
- Notes must not be copied into Process Trace or provider prompts unless a
  future design explicitly allows that.

## 6. Pipeline Output Schemas

### Shared Output Envelope

Every provider-backed output should validate the business payload plus:

- `schemaVersion`
- `locale`
- `warnings`

Provider mode, provider name, latency, token counts, fallback reason, and raw
provider errors belong to `ProviderCall`, `SchemaValidation`, and
`PipelineStep`, not inside provider business output.

### `ParseProfileOutput`

Produced by: `parseProfile`

Writes or feeds:

- `CareerProfile`
- profile skill mentions
- achievements
- interview-ready examples
- input summary

Shape:

- `profileSummary`
- `currentRole`
- `estimatedYearsExperience`
- `structuredExperience[]`
- `skills[]`
- `achievements[]`
- `interviewExamples[]`
- `inputSummary`
- `warnings[]`

`structuredExperience[]` fields:

- `experienceKey`
- `companyOrProject`
- `role`
- `periodLabel`
- `responsibilities[]`
- `outcomes[]`
- `technologies[]`
- `sourceReferences[]`

`skills[]` fields:

- `skillKey`
- `name`
- `category`
- `evidenceReferences[]`
- `recencySignal`
- `proficiencySignal`

Rules:

- `sourceReferences[]` may identify sections or broad line ranges, but must not
  preserve raw paragraphs.
- `proficiencySignal` is descriptive evidence, not a final score.
- Empty skills or empty experience should fail validation unless the input
  itself is rejected earlier.

### `ExtractJobRequirementsOutput`

Produced by: `extractJobRequirements`

Writes or feeds:

- `JobPosting`
- `JobRequirement[]`

Shape:

- `roleTitle`
- `jobSummary`
- `responsibilities[]`
- `expectedOutcomes[]`
- `requirements[]`
- `warnings[]`

`requirements[]` fields:

- `requirementKey`
- `normalizedText`
- `type`
- `category`
- `prioritySignal`
- `sourceReference`

Rules:

- `type` must be `required` or `preferred`.
- `prioritySignal` is 1 through 5 and is normalized into final `priority` and
  `weight` by deterministic logic.
- At least one required requirement should exist unless the job posting is
  rejected as invalid.

### `NormalizeSkillsOutput`

Produced by: `normalizeSkills`

Execution: deterministic, with optional embedding-assisted adjacent-skill
classification.

Writes or feeds:

- canonical skill groups
- aliases used
- matched, adjacent, missing, and pending skill groups

Shape:

- `canonicalSkills[]`
- `skillMatches[]`
- `aliasHits[]`
- `adjacentCandidates[]`
- `pendingSkills[]`
- `missingRequirementSkills[]`

`skillMatches[]` fields:

- `skillMatchKey`
- `canonicalSkillKey`
- `relationship`
- `profileSkillKeys[]`
- `requirementKeys[]`
- `evidenceReferences[]`
- `adjacencyScore`
- `basis`

`adjacentCandidates[]` may include:

- `candidateKey`
- `sourceSkillKey`
- `targetSkillKey`
- `similarityScore`
- `basis`
- `accepted`

Rules:

- Embedding similarity may support `adjacent`; it must not directly add points
  to the final match score.
- `basis` should describe the deterministic reason such as taxonomy alias,
  direct normalized match, or adjacent category.
- Unknown skill mentions should be retained as `pending`, not discarded.
- `canonicalSkillKey` may be null only when `relationship` is `pending`.
- `adjacencyScore` and `similarityScore` are the only confidence-like numeric
  fields allowed in skill normalization output.

### `ScoreMatchOutput`

Produced by: `scoreMatch`

Execution: deterministic.

Writes or feeds:

- `MatchAnalysis`
- `RequirementCoverage[]`
- `EvidenceGap[]`
- `KeyFinding[]`

Shape:

- `matchAnalysis`
- `requirementCoverage[]`
- `evidenceGaps[]`
- `keyFindings[]`

`matchAnalysis` fields:

- `matchScore`
- `scoreVersion`
- `weightVersion`
- `scoringBreakdown`
- `explanationSnapshot`

`scoringBreakdown` fields:

- `requiredCoverageScore`
- `preferredCoverageScore`
- `evidenceStrengthScore`
- `adjacentSkillSupportScore`
- `planReadinessScore`
- `requiredCoverageMax`
- `preferredCoverageMax`
- `evidenceStrengthMax`
- `adjacentSkillSupportMax`
- `planReadinessMax`
- `totalBeforeRounding`

`requirementCoverage[]` fields:

- `requirementKey`
- `status`
- `evidenceStrength`
- `evidenceFromProfile[]`
- `gapNote`

`evidenceGaps[]` fields:

- `gapKey`
- `linkedRequirementKey`
- `title`
- `whyItMatters`
- `evidenceToCreate`
- `difficulty`
- `expectedImpact`

Rules:

- `matchScore` must be an integer from 0 to 100.
- `evidenceStrength` is required even when coverage is `matched`.
- Plausible but unverifiable claims should validate as `weak` evidence.
- The initial scoring weights are defined in `docs/scoring-design.md`.

### `GeneratePlanOutput`

Produced by: `generatePlan`

Writes or feeds:

- `CareerPlan`
- 12 `PlanWeek` records
- `PlanTask[]`

Shape:

- `targetRole`
- `planSummary`
- `weeks[]`

`weeks[]` fields:

- `weekKey`
- `weekNumber`
- `objective`
- `reviewPrompt`
- `tasks[]`

`tasks[]` fields:

- `taskKey`
- `title`
- `evidenceToCreate`
- `linkedRequirementKey`
- `linkedEvidenceGapKey`
- `status`

Rules:

- Exactly 12 weeks are required.
- `weekNumber` must be 1 through 12 with no duplicates.
- Each week should have at least one task.
- Tasks should link to a requirement or evidence gap when possible.

### `GenerateInterviewSetOutput`

Produced by: `generateInterviewSet`

Writes or feeds:

- `InterviewQuestion[]`

Shape:

- `questions[]`

`questions[]` fields:

- `questionKey`
- `question`
- `category`
- `linkedRequirementKey`
- `linkedEvidenceGapKey`
- `evaluationFocus`

Rules:

- Exactly 6 questions are required.
- Category distribution is fixed:
  - `behavioral`: 2
  - `role_skill`: 2
  - `gap`: 1
  - `portfolio_evidence`: 1
- At least one question must link to an `EvidenceGap`.
- At least one question must ask about portfolio or evidence creation.
- Avoid concentrating all questions on one requirement.

### `BuildEvidenceBoardOutput`

Produced by: `buildEvidenceBoard`

Execution: deterministic. Evidence Builder is not a prose generation surface.

Writes or feeds:

- `EvidenceArtifact[]`

Shape:

- `materials[]`

`materials[]` fields:

- `artifactKey`
- `proofType`
- `title`
- `sourceRequirementKey`
- `sourceEvidenceGapKey`
- `whyItMatters`
- `evidenceToCreate`
- `nextAction`
- `source`
- `targetWeek`
- `status`

Rules:

- `status` starts as `not_started` unless review or interview activity creates a
  more specific later material.
- `source` is `analysis`, `plan`, `review`, or `interview`.
- `targetWeek` is optional but must be 1 through 12 when present.
- No generated resume bullets, README sections, interview stories, rewrite
  variants, or prose drafts are valid fields.

### `StructuredWeeklyReviewOutput`

Produced by: weekly review submission.

Writes or feeds:

- `WeeklyReview`
- `PlanAdjustment`
- optional `EvidenceUpdate`

Shape:

- `weekNumber`
- `progressStatus`
- `summary`
- `completedTaskKeys[]`
- `blockedTaskKeys[]`
- `nextActions[]`
- `planAdjustments[]`
- `evidenceUpdates[]`

Rules:

- Output must reference existing plan weeks/tasks/materials.
- New evidence material may be proposed only as structured material fields, not
  generated prose.
- Raw review text is never part of the output.

### `InterviewEvaluationOutput`

Produced by: interview answer evaluation.

Writes or feeds:

- `InterviewEvaluation`
- optional `EvidenceUpdate`

Shape:

- `answerSummary`
- `scores`
- `strengths[]`
- `improvementPoints[]`
- `missingEvidence[]`
- `improvedAnswerOutline`
- `suggestedEvidenceUpdates[]`

`scores` fields:

- `structure`
- `specificity`
- `roleRelevance`
- `evidenceStrength`
- `overall`

Rules:

- Scores are integers from 0 to 100.
- `improvedAnswerOutline` is allowed for Interview Studio feedback.
- `improvedAnswerOutline` must not fabricate evidence not present in the answer,
  profile, or existing analysis.
- Evidence updates are structured material updates only, not resume or README
  prose generation.

## 7. API View Schemas

API responses should use a consistent success envelope:

```text
{ data: ... }
```

Errors should use the error envelope defined in `docs/system-design.md`.

### `AnalysisSessionView`

Purpose: shared workspace context.

Fields:

- `id`
- `status`
- `providerMode`
- `embeddingMode`
- `displayTargetRoleTitle`
- `extractedTargetRoleTitle`
- `schemaVersion`
- `startedAt`
- `completedAt`
- `workspaceProgress`

### `AnalyzeView`

Fields:

- `session`
- `matchAnalysis`
- `keyFindings[]`
- `requirementCoverage[]`
- `skillMap`
- `evidenceGaps[]`

Rules:

- Show evidence and summaries, not raw submitted text.
- Show one target role label in normal UI. Do not separately expose
  `JobPosting.roleTitle`, `AnalysisSession.extractedTargetRoleTitle`, and
  `CareerPlan.targetRole` as competing labels.
- Include enough linked IDs for UI navigation to Plan, Interview Studio, and
  Evidence Builder.

### `PlanView`

Fields:

- `session`
- `careerPlan`
- `weeks[]`
- `tasks[]`
- `linkedEvidenceGaps[]`

Rules:

- Weeks are always rendered as 1 through 12.
- Task status is derived from plan/review records.

### `ReviewView`

Fields:

- `session`
- `currentWeek`
- `reviewHistory[]`
- `openTasks[]`
- `latestAdjustments[]`

Rules:

- Do not expose raw review answer text.
- Use summaries and structured next actions.

### `InterviewStudioView`

Fields:

- `session`
- `questions[]`
- `evaluations[]`
- `linkedEvidenceMaterials[]`

Rules:

- The initial question list must contain exactly 6 questions.
- Raw interview answers are not returned unless a future explicit edit flow is
  designed.

### `EvidenceBoardView`

Fields:

- `session`
- `materials[]`
- `statusCounts`
- `proofTypeCounts`
- `linkedRequirements[]`
- `linkedEvidenceGaps[]`

Rules:

- User-facing labels may call materials `証拠素材`, `応募素材`, or
  `ポートフォリオ素材`.
- No prose-generation drafts are returned.

### `TraceView`

Fields:

- `session`
- `pipelineRuns[]`
- `pipelineSteps[]`
- `providerCalls[]`
- `schemaValidations[]`
- `auditEvents[]`
- `scoringBreakdown`

Rules:

- Trace data is redacted by schema.
- No raw input, raw answers, raw prompts, raw completions, stack traces, SQL
  errors, or plaintext encrypted payloads are valid fields.

## 8. Validation And Fallback Rules

Provider output validation fails when:

- required fields are missing
- enum values are unknown
- arrays violate exact counts, such as 12 plan weeks or 6 interview questions
- links reference non-existent temporary keys
- provider output includes server-owned fields
- provider output includes raw input, raw prompt, or raw completion text
- provider output includes generic `confidence` fields outside adjacent-skill
  candidate support
- scores, weights, priority, or week numbers are out of range
- text fields exceed configured limits

Fallback behavior:

- Real provider failure triggers deterministic mock fallback for the same step.
- Mock fallback must pass the same schema.
- If mock validation fails, the session moves to `validation_error` or `failed`
  according to the system design.
- Process Trace records validation and fallback status without raw payloads.

## 9. Remaining Schema Questions

The current schema-level design questions are resolved. New schema questions
should be added here during fixture or implementation planning.
