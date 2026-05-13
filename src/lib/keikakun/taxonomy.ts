import type { SkillCategory, SkillRelationship } from "./types";

export interface CanonicalSkill {
  key: string;
  canonicalName: string;
  category: SkillCategory;
}

export interface SkillAlias {
  alias: string;
  canonicalName: string;
  locale: "ja-JP" | "en-US" | "any";
}

export interface SkillAdjacencyRule {
  sourceSkill: string;
  targetSkill: string;
  reason: string;
}

export interface NormalizedSkillMention {
  rawText: string;
  canonicalName: string | null;
  category: SkillCategory | "unknown";
  relationship: SkillRelationship;
  basis: string;
}

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  ...[
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "accessibility",
    "responsive UI",
    "component design",
    "frontend testing"
  ].map((name) => skill(name, "frontend")),
  ...[
    "Node.js",
    "API design",
    "REST API",
    "database design",
    "Prisma",
    "PostgreSQL",
    "authentication",
    "authorization",
    "input validation",
    "server actions",
    "route handlers",
    "error handling"
  ].map((name) => skill(name, "backend")),
  ...[
    "structured outputs",
    "prompt design",
    "RAG",
    "embeddings",
    "LLM evaluation",
    "provider fallback",
    "schema validation",
    "AI workflow design",
    "traceability",
    "mock providers"
  ].map((name) => skill(name, "ai")),
  ...[
    "SQL",
    "analytics",
    "data modeling",
    "dashboarding",
    "KPI reporting",
    "spreadsheet analysis",
    "CRM export analysis",
    "BI tools"
  ].map((name) => skill(name, "data")),
  ...[
    "Vercel",
    "AWS",
    "object storage",
    "environment management",
    "PostgreSQL hosting",
    "secrets management",
    "deployment"
  ].map((name) => skill(name, "cloud")),
  ...[
    "CI",
    "testing automation",
    "observability",
    "release workflow",
    "Playwright",
    "Vitest",
    "audit logging",
    "retry design"
  ].map((name) => skill(name, "devops")),
  ...[
    "product operations",
    "roadmap planning",
    "requirement definition",
    "user research",
    "feedback loop design",
    "prioritization",
    "product analytics",
    "acceptance criteria",
    "process design",
    "customer insight synthesis"
  ].map((name) => skill(name, "product")),
  ...[
    "customer success",
    "stakeholder analysis",
    "renewal risk management",
    "cost awareness",
    "go-to-market context",
    "operations improvement",
    "SaaS metrics",
    "business communication",
    "issue triage",
    "onboarding design"
  ].map((name) => skill(name, "business")),
  ...[
    "information architecture",
    "wireframing",
    "design systems",
    "usability review",
    "UX writing",
    "visual hierarchy"
  ].map((name) => skill(name, "design")),
  ...[
    "facilitation",
    "technical writing",
    "code review",
    "mentoring",
    "cross-functional collaboration",
    "decision documentation",
    "meeting design",
    "conflict resolution",
    "executive reporting",
    "requirements gathering"
  ].map((name) => skill(name, "collaboration")),
  ...[
    "Japanese business communication",
    "English documentation",
    "bilingual stakeholder communication"
  ].map((name) => skill(name, "language"))
];

export const SKILL_ALIASES: SkillAlias[] = [
  { alias: "NextJS", canonicalName: "Next.js", locale: "any" },
  { alias: "Next", canonicalName: "Next.js", locale: "any" },
  { alias: "TS", canonicalName: "TypeScript", locale: "any" },
  { alias: "Typescript", canonicalName: "TypeScript", locale: "any" },
  { alias: "retrieval augmented generation", canonicalName: "RAG", locale: "en-US" },
  { alias: "RAG pipeline", canonicalName: "RAG", locale: "en-US" },
  { alias: "要件定義", canonicalName: "requirement definition", locale: "ja-JP" },
  { alias: "要求整理", canonicalName: "requirements gathering", locale: "ja-JP" },
  { alias: "ステークホルダー調整", canonicalName: "stakeholder analysis", locale: "ja-JP" },
  { alias: "顧客要望整理", canonicalName: "customer insight synthesis", locale: "ja-JP" },
  { alias: "CS", canonicalName: "customer success", locale: "any" },
  { alias: "CRM分析", canonicalName: "CRM export analysis", locale: "ja-JP" },
  { alias: "スプレッドシート", canonicalName: "spreadsheet analysis", locale: "ja-JP" },
  { alias: "BIレポート", canonicalName: "BI tools", locale: "ja-JP" }
];

export const ADJACENCY_RULES: SkillAdjacencyRule[] = [
  {
    sourceSkill: "React",
    targetSkill: "Next.js",
    reason: "React experience is useful but weaker support for Next.js delivery."
  },
  {
    sourceSkill: "REST API",
    targetSkill: "API design",
    reason: "API implementation can support API design requirements."
  },
  {
    sourceSkill: "dashboarding",
    targetSkill: "KPI reporting",
    reason: "Dashboard work can support KPI reporting when metrics are explicit."
  },
  {
    sourceSkill: "facilitation",
    targetSkill: "requirement definition",
    reason: "Facilitation can support requirements work when decisions are captured."
  },
  {
    sourceSkill: "customer success",
    targetSkill: "customer insight synthesis",
    reason: "Customer-facing work can support insight synthesis with evidence."
  },
  {
    sourceSkill: "CRM export analysis",
    targetSkill: "SQL",
    reason: "CRM export analysis is adjacent to data literacy, but not a direct SQL match."
  },
  {
    sourceSkill: "operations improvement",
    targetSkill: "process design",
    reason: "Operational improvements are adjacent to owning repeatable process design."
  }
];

export function normalizeSkillMention(rawText: string): NormalizedSkillMention {
  const normalized = normalizeComparableText(rawText);
  const direct = CANONICAL_SKILLS.find(
    (candidate) => normalizeComparableText(candidate.canonicalName) === normalized
  );

  if (direct) {
    return {
      rawText,
      canonicalName: direct.canonicalName,
      category: direct.category,
      relationship: "matched",
      basis: "direct canonical match"
    };
  }

  const alias = SKILL_ALIASES.find(
    (candidate) => normalizeComparableText(candidate.alias) === normalized
  );

  if (alias) {
    const canonical = CANONICAL_SKILLS.find(
      (candidate) => candidate.canonicalName === alias.canonicalName
    );

    return {
      rawText,
      canonicalName: alias.canonicalName,
      category: canonical?.category ?? "unknown",
      relationship: "matched",
      basis: `alias match: ${alias.alias}`
    };
  }

  return {
    rawText,
    canonicalName: null,
    category: "unknown",
    relationship: "pending",
    basis: "no canonical skill or unambiguous alias"
  };
}

export function classifySkillRelationship(
  profileSkill: string,
  requiredSkill: string
): {
  relationship: Exclude<SkillRelationship, "pending">;
  basis: string;
  adjacencyScore?: number;
} {
  const profile = normalizeSkillMention(profileSkill);
  const required = normalizeSkillMention(requiredSkill);

  if (!profile.canonicalName || !required.canonicalName) {
    return { relationship: "missing", basis: "pending skill cannot score" };
  }

  if (profile.canonicalName === required.canonicalName) {
    return { relationship: "matched", basis: "same canonical skill" };
  }

  const rule = ADJACENCY_RULES.find(
    (candidate) =>
      candidate.sourceSkill === profile.canonicalName &&
      candidate.targetSkill === required.canonicalName
  );

  if (rule) {
    return {
      relationship: "adjacent",
      basis: rule.reason,
      adjacencyScore: 0.62
    };
  }

  return { relationship: "missing", basis: "no accepted adjacency rule" };
}

export function normalizeComparableText(value: string): string {
  return value.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

function skill(canonicalName: string, category: SkillCategory): CanonicalSkill {
  return {
    key: canonicalName.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-"),
    canonicalName,
    category
  };
}
