# キャリアけいかくん UI Design Notes

Last updated: 2026-05-15

This document is the canonical UI design record for the キャリアけいかくん demo app.
It is the source of truth for screen behavior and interaction decisions.

## Product UI Goal

キャリアけいかくん should feel like a clear toC web app, not a generic SaaS dashboard.
The user should understand what to do within a few seconds:

1. Paste a career history.
2. Paste a target job posting.
3. See match score, gaps, evidence needs, a 90-day action plan, interview
   practice, and evidence materials to create.

The visible product should be simple and approachable. The implementation behind
it should show professional AI application engineering: structured extraction,
skill normalization, deterministic scoring, constrained plan generation,
state updates, validation, and traceable audit events.

## Primary Audiences

- Contract clients evaluating whether to outsource AI/web development work.
- Recruiters or hiring managers looking for a clear portfolio project.
- Technical interviewers who may inspect the implementation and architecture.

## UX Principles

- Do not start with a marketing landing page. The first screen must begin the
  actual app experience.
- Keep the first action obvious. Use two clear start choices instead of a large
  multi-section homepage.
- Keep input minimal. Initial input is only career history and job posting.
- Make the first result score-centered so value is visible immediately.
- Let deeper evidence appear below the summary rather than hiding all detail.
- Use the workspace only after analysis is complete.
- Make the Review experience conversational, but store the result as structured
  data.
- Keep Process Trace visible from the workspace menu because it is part of the
  technical proof, but do not let it dominate the user journey.

## AI Coach Persona

Decision: the product voice should feel like a practical cram-school teacher
for career preparation.

Personality:

- Fundamentally supportive and on the user's side.
- Objective when evaluating fit, evidence, and interview answers.
- Direct about weak points instead of softening every gap.
- Calm, specific, and action-oriented.
- Professional enough for working adults, not playful or mascot-like.

Voice rules:

- Start from what is usable, then state what is missing.
- Say clearly when evidence is weak, unverifiable, too generic, or not connected
  to the target role.
- Pair critical feedback with the next concrete action.
- Avoid exaggerated encouragement, vague praise, or hiring-success promises.
- Avoid shaming language. Critique the evidence, answer, or preparation state,
  not the person.

Example tone:

- Good: `この経験は要件に近いです。ただし成果の数字がないため、証拠としてはまだ弱いです。次は改善前後の指標を1つ追加しましょう。`
- Good: `回答の構成は使えます。弱いのは、あなたが何を判断したのかが見えない点です。意思決定の理由を1文足してください。`
- Avoid: `完璧です。これなら安心です。`
- Avoid: `このままだと厳しいです。`

## Confirmed Navigation

```text
Start
  -> Input / Analyze
  -> Workspace
       - Analyze
       - Plan
       - Review
       - Interview Studio
       - Evidence Builder
       - Process Trace
```

## Start Screen

Purpose: communicate what the app does and let the user begin without friction.

Content:

- Main heading: career history and job posting are used to find evidence to
  create over 90 days.
- Short supporting copy: the app organizes experience, job requirements, skill
  gaps, and weekly preparation.
- Two start actions:
  - Start with sample data.
  - Analyze my own content.

Design notes:

- The Start screen is one section only.
- Do not show the step bar on the Start screen. The Start screen is the entry
  choice before the guided flow begins.
- The screen should not become a full marketing page.
- Avoid long explanatory sections.
- The two actions should lead directly into the next screen.
- The supporting copy may mention what happens next in one short sentence, but
  it should not become a separate feature section or guide.

## Input / Analyze Screen

Purpose: gather enough information to run the analysis without making the user
feel like they are filling out a long business form.

Content:

- Step indicator begins here, after the user selects either Start action:
  `Content input / check -> AI analysis -> Workspace`.
- Career history text area.
- Job posting text area.
- Optional raw-storage consent control for users who want to keep encrypted raw
  input for later editing or reanalysis. It is off by default.
- If the user selected sample data, both text areas are prefilled and editable.
- Analyze button.
- Lightweight input quality checks:
  - Career history is too short.
  - Job posting is too short.
  - Reminder not to paste unnecessary personal information.

Loading pipeline:

- Structuring career history.
- Extracting job requirements.
- Normalizing skills.
- Calculating match score.
- Creating 90-day plan.

Design notes:

- The loading state should communicate that the app runs a pipeline, not a
  single opaque prompt.
- The loading text doubles as user reassurance and technical storytelling.

## Workspace Shell

Purpose: provide an app-like workspace after analysis is complete.

Left menu:

- Analyze
- Plan
- Review
- Interview Studio
- Evidence Builder
- Process Trace

Persistent workspace context:

- Extracted target role or job title.
- Analysis timestamp.
- Provider mode indicator only:
  - `実行モード: Real`
  - `実行モード: Fallback`
  - `実行モード: Mock`
- New analysis action.

Routes:

- `/workspace/[sessionId]/analyze`
- `/workspace/[sessionId]/plan`
- `/workspace/[sessionId]/review`
- `/workspace/[sessionId]/interview`
- `/workspace/[sessionId]/evidence`
- `/workspace/[sessionId]/trace`

Design notes:

- Do not show the workspace menu before analysis.
- Keep the menu compact. This is not a full CRM or enterprise SaaS.
- Do not show provider failure reasons in the workspace header. Keep the header
  to the compact provider mode; detailed fallback and validation information
  belongs in Process Trace.
- On mobile, replace the left menu with a horizontally scrollable top tab bar.
  Do not hide the primary workspace sections behind a hamburger menu.

## Analyze Screen

Purpose: show the core result. This is the main proof of product value and the
main place where technical depth becomes visible to a reviewer.

Confirmed structure:

```text
Analyze
  1. Score Summary
  2. Key Findings
  3. Requirement Coverage
  4. Skill Map
  5. Evidence Gaps
  6. Next Action
```

### 1. Score Summary

Content:

- Match Score, for example `76%`.
- Verdict label, for example `Ready with focused evidence`.
- Extracted target role or job title.
- Score breakdown:
  - Required requirement coverage.
  - Preferred requirement coverage.
  - Evidence strength.
  - Skill proximity.

### 2. Key Findings

Use three compact groups:

- Strengths:
  - Experience that maps well to the job.
  - Achievements likely to be useful.
  - Skills already aligned with the role.
- Priority Gaps:
  - Missing required requirements.
  - Weakly evidenced experience.
  - Areas to address within 90 days.
- Evidence Needed:
  - Concrete proof the user should create.
  - Interview proof points to prepare.
  - Evidence materials such as small demos, analysis notes, work samples, or
    measurable examples.

Limit each group to around three items so the result stays scannable.

### 3. Requirement Coverage

Purpose: prove that the analysis is grounded in the job posting and career
history rather than being a generic AI opinion.

Table fields:

- Requirement
- Type: Required or Preferred
- Status: Matched, Partial, or Missing
- Weight
- Evidence from profile
- Gap note

### 4. Skill Map

Purpose: show extracted and normalized skills.

Content:

- Matched skills.
- Adjacent skills.
- Missing skills.
- Skill categories, for example:
  - Frontend Engineering
  - AI Workflow
  - Data Analysis
  - Project Management
  - Operations

Design note:

- Show normalization where useful, for example `React / Next.js / TypeScript`
  mapped into `Frontend Engineering`.

### 5. Evidence Gaps

Purpose: connect analysis to the product concept: the user is not just missing
skills, they are missing visible proof.

Fields:

- Gap
- Why it matters
- Evidence to create
- Linked requirement
- Difficulty
- Expected impact

### 6. Next Action

Content:

- First recommended action for the next seven days.
- Main theme for the 90-day plan.
- CTA to open Plan.

## Plan Screen

Purpose: turn the analysis into a concrete 90-day preparation plan.

Content:

- 12 weekly cards.
- Each card includes:
  - Week number.
  - Objective.
  - Tasks.
  - Evidence to create.
  - Review prompt.
  - Button to review this week.

Design notes:

- Use week cards rather than a long timeline.
- Keep `Evidence to create`; it is central to the product concept.
- Highlight the current or next active week.

## Review Screen

Purpose: show that this is an ongoing coaching workflow, not a one-time
diagnosis.

Confirmed direction:

```text
Review = chat-guided structured weekly check-in
```

User experience:

- A career coach bot asks questions in a chat-like flow.
- The user can answer in natural language.
- The bot collects weekly progress, blockers, artifacts, and next intent.
- The user confirms with an apply action.

Internal data structure:

- weekNumber
- completedWork
- blockers
- artifactsCreated
- learningNotes
- nextWeekIntent
- progressStatus
- planAdjustments
- evidenceUpdates

Layout:

- Left: chat flow.
- Right: selected week plan card and collected review summary.
- Bottom: message input.
- Final action: apply review.

Design notes:

- On mobile, show the chat flow first. Put the selected week plan and collected
  summary in a collapsible section below or above the latest structured result.
- The bot should feel like a practical career coach, not a playful character.
- The coach should be supportive but direct, like a cram-school teacher. It
  should clearly identify weak evidence, generic answers, and missing proof.
- Review should use a guided question flow with optional follow-up, not an
  unlimited open-ended chat.
- Behind the scenes, the submitted review must be converted into structured
  data and used to update the plan state.

## Interview Studio Screen

Purpose: help the user turn gaps and evidence candidates into interview-ready
answers for the target role.

Content:

- Question list generated from:
  - target role
  - job requirements
  - requirement coverage
  - evidence gaps
  - plan progress
- Initial question count: 6.
- Initial categories:
  - behavioral: 2
  - role skill: 2
  - gap: 1
  - portfolio/evidence: 1
- Selected question detail.
- Answer input.
- Evaluate answer action.
- Evaluation result:
  - specificity
  - business impact
  - role fit
  - evidence strength
  - weak points
  - revised STAR-style outline
  - linked requirements or gaps

Design notes:

- On mobile, show the question list first, then the selected question, answer
  input, and evaluation result below it.
- Interview Studio is a structured practice surface, not a free chat.
- Keep the question list scannable and let the selected question own the main
  interaction area.
- Evaluation should be direct and practical. Avoid language that implies the app
  can create a guaranteed hiring answer.
- Feedback may say an answer is too generic or unsupported, but it must pair the
  critique with a concrete improvement.

## Evidence Builder Screen

Purpose: organize the proof the user should create, collect, or improve. This is
an evidence material board, not a resume or README writing tool.

Content:

- Evidence material filters:
  - status
  - proof type
  - source: analysis, plan, review, interview
  - linked requirement or gap
- Evidence material list.
- Selected material detail:
  - title
  - proof type
  - source requirement or gap
  - why it matters
  - evidence to create
  - next action
  - target week
  - status
- Update status action.
- Add note action.

Design notes:

- On mobile, show compact filter chips above the evidence material list. Keep
  the list first and show the selected material detail below or as a drill-in
  view.
- Evidence Builder should make proof creation feel concrete without generating
  application text.
- Use the Evidence Gold accent sparingly for material metadata and source links.
- Do not include regenerate, rewrite, resume-bullet, README-section, or
  interview-story generation actions.

## Process Trace Screen

Purpose: provide technical proof for clients and interviewers.

Content:

- Pipeline steps:
  - parseProfile
  - extractJobRequirements
  - normalizeSkills
  - scoreMatch
  - generatePlan
  - generateInterviewSet
  - buildEvidenceBoard
  - recordAuditEvent
- Status for each step:
  - success
  - fallback
  - validation error
- Provider:
  - real provider
  - mock fallback
  - mock
- Schema validation results.
- Embedding mode and similarity use.
- Scoring breakdown.
- Audit events.
- Provider fallback details:
  - selected provider
  - provider call status
  - fallback provider
  - reason code
  - fallback validation result

Design notes:

- Do not expose raw long-form user input unnecessarily.
- Prefer hashes, summaries, and structured outputs.
- Process Trace should be visible from the left menu, but it should be visually
  quieter than the product-facing Analyze and Plan screens.
- Process Trace may show provider failure and fallback reason codes, but it must
  not show raw prompts, raw completions, stack traces, or raw user input.
- On mobile, render Process Trace as a vertical event list rather than dense
  tables.

## Mobile Layout Decisions

- Workspace navigation becomes a horizontally scrollable top tab bar.
- Review shows the chat flow first. Week plan and collected review summary are
  secondary and collapsible.
- Interview Studio shows the question list first, then selected answer and
  evaluation below.
- Evidence Builder uses compact filter chips and shows the material list before
  selected detail.
- Process Trace uses a vertical event list instead of tables.
- Touch targets should be at least 44px tall.

## Open UI Questions

The current UI design questions are resolved. New UI questions should be added
here during fixture or implementation planning.

## Decision Log

- 2026-05-13: Earlier narrow-scope screens were confirmed as Analyze, Plan,
  Review, and Process Trace after the initial Start and Input flow.
- 2026-05-13: Overview and Match were merged into a single Analyze screen.
- 2026-05-13: Analyze screen confirmed as score-centered with deeper coverage,
  skill map, evidence gaps, and next action sections.
- 2026-05-13: Plan screen confirmed as 12 week cards, not a timeline.
- 2026-05-13: Review confirmed as chat-guided structured weekly check-in.
- 2026-05-13: Process Trace confirmed as a visible workspace menu item for
  technical proof.
- 2026-05-15: Trace label finalized as `Process Trace`.
- 2026-05-15: Visual tone and component direction moved into `DESIGN.md`.
- 2026-05-15: Scope changed from a narrow screen set to the full public demo:
  Analyze, Plan, Review, Interview Studio, Evidence Builder, and Process Trace.
- 2026-05-15: Session model confirmed as anonymous session history, without
  account registration.
- 2026-05-15: Provider strategy confirmed as real-first with deterministic mock
  fallback.
- 2026-05-15: Workspace provider display confirmed as compact mode only
  (`Real`, `Fallback`, `Mock`); detailed fallback reasons live in Process Trace.
- 2026-05-15: Start screen confirmed as a single entry section with no step bar.
  The guided step bar starts only after the user chooses sample data or their
  own content.
- 2026-05-15: AI coach persona confirmed as supportive but objective and direct,
  similar to a practical cram-school teacher for career preparation.
- 2026-05-15: Mobile layout confirmed: top scrollable workspace tabs, chat-first
  Review, question-first Interview Studio, list-first Evidence Builder, and
  event-list Process Trace.
