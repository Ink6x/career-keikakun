# キャリアけいかくん Scoring Design

Last updated: 2026-05-15

This document defines the deterministic match scoring policy for キャリアけいかくん.
It is a design document, not implementation code.

Use this document with `docs/schema-design.md`,
`docs/skill-taxonomy-design.md`, and `docs/system-design.md`. The LLM may
produce extraction, summaries, and explanation text, but it must not assign the
final match score.

## 1. Adopted Configuration

Decision: use a five-part deterministic score.

Final score is 100 points:

```text
required coverage:        45
preferred coverage:       15
evidence strength:        25
adjacent skill support:   10
plan readiness:            5
```

Adopted rules:

- Required requirements matter more than preferred requirements.
- Evidence strength is a major component because the product is about creating
  credible proof, not just claiming experience.
- Plausible but unverifiable claims are treated as weak evidence.
- Adjacent skills contribute as weaker support, not as direct matches.
- Adjacent skill support is capped at 50% of the equivalent direct match value.
- Embedding similarity never contributes directly to score.
- Plan readiness is included lightly, at 5 points, so the 90-day plan matters
  without overtaking match quality.
- Process Trace exposes `scoreVersion`, `weightVersion`, and full score
  breakdown.

Recommended initial versions:

```text
scoreVersion: 2026-05-15
weightVersion: 2026-05-15
```

## 2. Score Components

### Required Coverage: 45 Points

Required coverage measures how well the profile covers required job
requirements.

Inputs:

- required `JobRequirement` rows
- `RequirementCoverage.status`
- normalized skill relationships
- evidence references

Status value:

- `matched`: 1.0
- `partial`: 0.5
- `missing`: 0.0

Rules:

- Missing required requirements should create high-priority evidence gaps.
- Weak evidence can downgrade an otherwise matched requirement to partial.
- Required coverage is computed from requirement priority and normalized weight,
  not from raw provider wording.

### Preferred Coverage: 15 Points

Preferred coverage measures nice-to-have fit.

Status value:

- `matched`: 1.0
- `partial`: 0.5
- `missing`: 0.0

Rules:

- Missing preferred requirements should not dominate the final score.
- Preferred gaps may become next actions, but they are lower priority than
  missing required requirements.

### Evidence Strength: 25 Points

Evidence strength measures whether the user can prove the match.

Evidence values:

- `strong`: 1.0
- `moderate`: 0.7
- `weak`: 0.3
- `none`: 0.0

Strong evidence examples:

- quantified achievement
- shipped project or artifact
- decision-making example
- repeated use across roles
- interview-ready story with concrete context

Weak evidence examples:

- generic claim without project context
- skill keyword listed with no outcome
- plausible but unverifiable responsibility
- one-off mention with no evidence trail

Decision: penalize unverifiable but plausible claims aggressively. They should
usually count as `weak`, not `moderate`, unless there is supporting context.

### Adjacent Skill Support: 10 Points

Adjacent skill support measures whether the profile has accepted adjacent skills
for missing or partial requirements.

Rules:

- `matched` skills can count as direct support in coverage.
- `adjacent` skills can contribute at up to 50% of a direct match.
- `missing` skills contribute 0.
- `pending` skills contribute 0 until normalized.
- Embedding similarity may suggest adjacency candidates, but accepted adjacency
  is determined by taxonomy, alias, category, and explicit adjacency rules.

Examples:

- React experience can be adjacent support for Next.js.
- API design can be adjacent support for backend implementation.
- dashboarding can be adjacent support for KPI reporting.

### Plan Readiness: 5 Points

Plan readiness measures whether the generated plan gives a credible path for
the identified gaps.

Signals:

- all high-priority gaps appear in the 12-week plan
- tasks are linked to requirements or evidence gaps
- evidence materials have target weeks
- plan has realistic weekly distribution

Rules:

- Plan readiness should not hide weak fit.
- A good plan can modestly improve the score, but cannot compensate for missing
  required coverage or no evidence.

## 3. Requirement Coverage Rules

Coverage status:

- `matched`: direct requirement support exists through evidence and/or matched
  canonical skill.
- `partial`: accepted adjacent skill, related achievement, or weak evidence
  exists.
- `missing`: no reliable profile evidence or accepted adjacent skill exists.

Evidence strength still applies when coverage is `matched`. A requirement can
be technically matched but still have weak evidence, which should reduce the
evidence component and may create an evidence material.

## 4. Breakdown Shape

`scoringBreakdown` should include:

- `scoreVersion`
- `weightVersion`
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
- `finalScore`

The UI may show a compact breakdown. Process Trace should show the full
breakdown with version fields and no raw user input.

## 5. LLM Boundary

LLM may:

- explain gaps in user-facing language
- summarize evidence references
- draft plan tasks and review prompts
- help classify ambiguous skill mentions before deterministic validation

LLM must not:

- assign `matchScore`
- assign final component scores
- decide final requirement weights
- directly convert embedding similarity into points
- override schema validation

## 6. Tests

Required scoring tests:

- required requirements weigh more than preferred requirements
- missing required requirements reduce score strongly
- adjacent skills contribute at 50% or less of direct match value
- pending skills do not contribute to score
- weak unverifiable evidence scores lower than moderate evidence
- plan readiness contributes no more than 5 points
- embedding similarity has no direct score contribution
- score output includes `scoreVersion` and `weightVersion`

## 7. Remaining Scoring Questions

The scoring weights, evidence-strength policy, and fixture case levels are
resolved. Remaining work before implementation:

- Define exact per-requirement aggregation formulas.
- Define exact rounding behavior.
