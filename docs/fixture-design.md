# キャリアけいかくん Fixture Design

Last updated: 2026-05-15

This document defines the sample data and deterministic fixture direction for
the first implementation. It is a design document, not fixture source code.

## 1. Main Demo Persona

Decision: use a BtoB SaaS customer success persona moving toward Product
Operations / Customer Success Operations.

This persona is intentionally realistic and slightly under-qualified. The goal
is to show that キャリアけいかくん can identify reachable gaps and concrete evidence
to create, not that the sample candidate is already obviously qualified.

Current profile:

- Japanese-speaking BtoB SaaS customer success professional.
- 3 to 4 years of experience.
- Has handled onboarding, customer support, usage follow-up, and renewal-risk
  communication.
- Has organized customer issues and translated recurring requests into internal
  notes.
- Has light experience with spreadsheets, CRM exports, helpdesk data, and simple
  reporting.
- Has collaborated with sales, product, and support teams.
- Has some operational improvement examples, but weak quantified outcomes.
- Has little direct SQL, BI, automation, or product-ops process ownership.

Target role:

- Product Operations Associate
- Customer Success Operations
- AI SaaS Operations / BizOps-adjacent role

Target role requirements should include:

- customer insight synthesis
- support and usage data analysis
- product feedback loop design
- internal process improvement
- stakeholder communication
- spreadsheet or BI-based reporting
- basic SQL or data literacy
- AI tool / automation interest
- evidence of turning customer issues into product or operation improvements

Expected demo match:

```text
62-70
```

The score should be high enough to feel reachable and low enough to create
visible gaps, plan tasks, interview feedback, and evidence materials.

## 2. Why This Persona

This persona is useful for the public demo because:

- Recruiters and hiring managers can imagine the candidate.
- The candidate is not a senior engineer or unusually strong operator.
- The current experience has real transferable evidence.
- The target role naturally exposes gaps in data, process ownership, and proof.
- The app's evidence-building concept becomes easy to understand.
- The persona does not invite direct comparison with an engineering portfolio
  owner.

## 3. Fixture Cases

Use one persona family and three match variants.

### `medium-main`

Primary demo case.

- Current role: BtoB SaaS customer success.
- Target role: Product Operations / CS Ops.
- Expected score: 62-70.
- Purpose: public sample data and default mock fallback.
- Expected output: balanced strengths and gaps.

### `high-match`

Stronger variant for scoring tests.

- Adds clearer reporting ownership.
- Adds quantified improvement example.
- Adds stronger product feedback loop experience.
- Expected score: 78-86.
- Purpose: verify high-score behavior without making the main demo too strong.

### `low-match`

Weaker variant for scoring tests.

- Mostly support execution with limited process ownership.
- Minimal data analysis.
- Vague outcomes.
- Expected score: 38-50.
- Purpose: verify missing required coverage, evidence gaps, and plan generation.

## 4. Sample Data Rules

- All sample data must be synthetic.
- Do not use real company names, personal names, customer names, or client
  details.
- UI-facing sample text should be Japanese-first.
- Technical terms such as CRM, SQL, BI, SaaS, and AI may remain in English.
- Sample career history should include enough detail for evidence extraction,
  but leave measurable outcomes partially weak in the main case.
- Sample job posting should be plausible, not copied from a real listing.

## 5. Mock Output Rules

Mock provider output must:

- complete the full flow without API keys
- use the same Zod schemas as real provider output
- produce deterministic Analyze, Plan, Review, Interview, Evidence, and Trace
  data
- include 6 interview questions
- include 12 plan weeks
- include evidence materials linked to gaps and requirements
- include trace-safe provider, validation, scoring, and fallback metadata
- never include raw prompts, raw completions, or real personal information

## 6. Fixture Test Expectations

Fixture tests should verify:

- `medium-main` renders a believable public demo.
- `high-match` scores higher than `medium-main`.
- `low-match` scores lower than `medium-main`.
- weak evidence creates evidence gaps even when skills are adjacent.
- the mock provider can complete the whole flow without API keys.
- Process Trace renders validation and fallback events without raw text.

