# キャリアけいかくん Skill Taxonomy Design

Last updated: 2026-05-15

This document defines the skill taxonomy, alias, and adjacent-skill policy for
キャリアけいかくん. It is a design document, not seed data or implementation code.

Use this document with `docs/schema-design.md` and `docs/prisma-design.md`.
The taxonomy exists to make skill matching explainable, testable, and stable
across real provider and deterministic mock execution.

## 1. Adopted Configuration

Decision: use the recommended balanced taxonomy configuration.

Adopted choices:

- Taxonomy scope: technical, product, business, and collaboration skills.
- Structure: top-level category plus canonical skill. Do not introduce deep
  parent-child hierarchies in the first design.
- Seed size: 80 to 120 canonical skills.
- Alias policy: normalized alias table plus embedding-assisted adjacent-skill
  candidate classification.
- Unknown skill policy: retain unknown terms as pending normalization records.
- Scoring connection: use `matched`, `adjacent`, `missing`, and `pending` as
  explicit skill relationship states.

This keeps the taxonomy strong enough for credible matching without turning the
demo into a taxonomy-management product.

## 2. Category Scope

Initial top-level categories:

- `frontend`
- `backend`
- `ai`
- `data`
- `cloud`
- `devops`
- `product`
- `business`
- `design`
- `collaboration`
- `language`
- `other`

Notes:

- `business` covers reusable business skills such as stakeholder analysis,
  requirements discovery, KPI thinking, and go-to-market context.
- `collaboration` covers communication, facilitation, cross-functional work,
  mentoring, and review practices.
- `language` is included because job postings often treat Japanese/English
  ability as a concrete requirement.
- Domain-specific terms that are not reusable skills should not become broad
  first-pass taxonomy categories. Preserve them as `pending` or `other` until a
  concrete rule is added.

## 3. Seed Size And Examples

Target seed size:

```text
80-120 canonical skills
```

The initial seed should be broad, not exhaustive. Example distribution:

- frontend: 8-12 skills
- backend: 10-14 skills
- ai: 8-12 skills
- data: 6-10 skills
- cloud: 6-10 skills
- devops: 6-10 skills
- product: 8-12 skills
- business: 8-12 skills
- design: 4-8 skills
- collaboration: 8-12 skills
- language: 2-4 skills
- other: reserved for fallback only

Example canonical skills:

- frontend: React, Next.js, TypeScript, accessibility, responsive UI
- backend: Node.js, API design, database design, Prisma, authentication
- ai: structured outputs, RAG, embeddings, prompt design, evaluation
- data: SQL, analytics, data modeling, dashboarding
- cloud: Vercel, AWS, object storage, environment management
- devops: CI, testing automation, observability, release workflow
- product: user research, roadmap planning, requirement definition
- business: KPI design, stakeholder analysis, cost awareness
- collaboration: technical writing, code review, facilitation, mentoring
- language: Japanese business communication, English documentation

The seed should be versioned so future changes can be explained in tests and
Process Trace.

## 4. Alias Policy

Decision: use a normalized alias table.

Alias examples:

- `NextJS`, `Next.js`, `Next` -> `Next.js`
- `TS`, `Typescript` -> `TypeScript`
- `RAG pipeline`, `retrieval augmented generation` -> `RAG`
- `要件定義`, `requirements gathering` -> `requirement definition`
- `ステークホルダー調整`, `stakeholder management` -> `stakeholder analysis`

Alias rules:

- Alias matching is deterministic and case-insensitive after basic cleanup.
- Alias records point to one canonical skill.
- Alias records may include locale and source notes.
- Alias matching produces `matched`, not `adjacent`.
- Ambiguous aliases should not be forced into one canonical skill. Store the
  mention as `pending` unless context disambiguates it.

## 5. Adjacent-Skill Policy

Decision: embeddings may suggest adjacent-skill candidates, but deterministic
rules decide whether adjacency is accepted.

Accepted adjacency requires:

- a candidate canonical skill
- a compatible category or explicit adjacency rule
- enough textual basis from the profile or requirement
- no stronger exact or alias match already available

Examples:

- React experience may be adjacent to Next.js when the job requires Next.js.
- REST API design may be adjacent to backend API implementation.
- analytics dashboarding may be adjacent to KPI reporting.
- stakeholder facilitation may be adjacent to requirement discovery.

Embedding similarity must not directly contribute to the final match score. It
only helps propose candidates for deterministic acceptance or rejection.

Process Trace should show:

- alias hits
- adjacent candidates
- accepted adjacent matches
- rejected adjacent candidates
- pending skills
- direct score contribution from embeddings: `none`

## 6. Unknown Skill Policy

Decision: do not discard unknown skill terms.

Unknown terms become pending normalization records when they appear in profile or
requirement extraction but cannot be safely mapped to a canonical skill or
accepted adjacent skill.

Pending records should store:

- raw skill text
- inferred category when available
- source side: profile or requirement
- source reference
- reason for pending status

Pending records:

- appear in Process Trace or debug-facing skill map details
- do not add direct score
- may create evidence review opportunities
- can become future seed or alias candidates

## 7. Scoring Connection

Skill relationship states:

- `matched`: exact canonical match or alias match
- `adjacent`: accepted adjacent skill based on deterministic rules; contributes
  at up to 50% of direct match value
- `missing`: requirement skill has no profile support
- `pending`: skill mention could not be safely normalized

Scoring rules:

- `matched` can contribute normally.
- `adjacent` can contribute as weaker support through deterministic scoring.
- `missing` creates or strengthens an evidence gap.
- `pending` does not contribute directly to score.

The final match score still comes from deterministic scoring over requirements,
coverage, evidence strength, and accepted skill relationships. The LLM does not
assign the final skill score.

## 8. Prisma Shape

Normalize:

- `SkillTaxonomy`
- `SkillAlias`
- `SkillAdjacencyRule`
- `ProfileSkill`
- `RequirementSkill`

Recommended field intent:

- `SkillTaxonomy`: canonical name, category, status, seed version.
- `SkillAlias`: alias text, normalized alias text, locale, canonical skill link.
- `SkillAdjacencyRule`: source skill, target skill, category, reason, status.
- `ProfileSkill`: raw mention, canonical skill link when known, category,
  relationship status, source reference, evidence reference.
- `RequirementSkill`: raw mention, canonical skill link when known, category,
  relationship status, requirement link, source reference.

`ProfileSkill.canonicalSkillId` and `RequirementSkill.canonicalSkillId` are
nullable for pending records.

## 9. Zod Shape

`NormalizeSkillsOutput` should include:

- `canonicalSkills[]`
- `skillMatches[]`
- `aliasHits[]`
- `adjacentCandidates[]`
- `pendingSkills[]`
- `missingRequirementSkills[]`

`skillMatches[].relationship` must use:

```text
matched | adjacent | missing | pending
```

## 10. Remaining Taxonomy Questions

The high-level taxonomy configuration is resolved. Remaining work before
implementation:

- Draft the actual 80-120 seed skills.
- Draft the initial alias list.
- Draft adjacency rules for the highest-value skill pairs.
