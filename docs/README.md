# キャリアけいかくん Documentation Index

Last updated: 2026-05-15

This folder contains the canonical design and implementation handoff documents
for キャリアけいかくん.

## Read First

1. `../AGENTS.md` - operational rules for agents and developers.
2. `agent-development-guide.md` - primary implementation handoff.
3. `system-design.md` - backend behavior, pipeline, privacy, and API boundaries.
4. `schema-design.md` - planned Zod request, pipeline, and API view contracts.
5. `skill-taxonomy-design.md` - taxonomy, aliases, adjacency, and pending skills.
6. `scoring-design.md` - deterministic scoring weights and evidence policy.
7. `fixture-design.md` - synthetic persona and high/medium/low fixture cases.
8. `prisma-design.md` - normalized tables, JSONB fields, constraints, and delete
   policy.
9. `ui-design.md` - screen behavior and interaction decisions.
10. `../DESIGN.md` - visual direction, components, and responsive rules.

## Background Only

- `project-overview.md` - original project context and historical rationale.

When documents conflict, prefer the read-first order above. `project-overview.md`
should not override later canonical decisions.

## Current State

Major design questions are resolved. Implementation can begin with:

- app scaffold
- Prisma schema
- Zod schemas
- deterministic mock provider and fixtures
- UI shell and sample-data flow

Remaining details should be resolved as implementation issues, not as broad
product redesign.

