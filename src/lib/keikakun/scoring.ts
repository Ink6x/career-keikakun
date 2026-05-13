import {
  SCORE_VERSION,
  WEIGHT_VERSION,
  type EvidenceGap,
  type EvidenceStrength,
  type PlanWeek,
  type RequirementCoverage,
  type ScoringBreakdown,
  type SkillRelationship
} from "./types";

const REQUIRED_COVERAGE_MAX = 45;
const PREFERRED_COVERAGE_MAX = 15;
const EVIDENCE_STRENGTH_MAX = 25;
const ADJACENT_SKILL_SUPPORT_MAX = 10;
const PLAN_READINESS_MAX = 5;

const coverageStatusValues = {
  matched: 1,
  partial: 0.5,
  missing: 0
} as const;

const evidenceStrengthValues: Record<EvidenceStrength, number> = {
  strong: 1,
  moderate: 0.7,
  weak: 0.3,
  none: 0
};

export function skillRelationshipValue(relationship: SkillRelationship): number {
  if (relationship === "matched") {
    return 1;
  }

  if (relationship === "adjacent") {
    return 0.5;
  }

  return 0;
}

export function calculateScoringBreakdown(
  requirementCoverage: RequirementCoverage[],
  evidenceGaps: EvidenceGap[],
  planWeeks: PlanWeek[]
): ScoringBreakdown {
  const requiredCoverageScore = roundScore(
    weightedCoverageScore(
      requirementCoverage.filter((coverage) => coverage.type === "required"),
      REQUIRED_COVERAGE_MAX
    )
  );
  const preferredCoverageScore = roundScore(
    weightedCoverageScore(
      requirementCoverage.filter((coverage) => coverage.type === "preferred"),
      PREFERRED_COVERAGE_MAX
    )
  );
  const evidenceStrengthScore = roundScore(
    weightedEvidenceScore(requirementCoverage, EVIDENCE_STRENGTH_MAX)
  );
  const adjacentSkillSupportScore = roundScore(
    adjacentSkillSupportScoreFor(requirementCoverage)
  );
  const planReadinessScore = roundScore(planReadinessScoreFor(evidenceGaps, planWeeks));

  const totalBeforeRounding =
    requiredCoverageScore +
    preferredCoverageScore +
    evidenceStrengthScore +
    adjacentSkillSupportScore +
    planReadinessScore;

  return {
    scoreVersion: SCORE_VERSION,
    weightVersion: WEIGHT_VERSION,
    requiredCoverageScore,
    preferredCoverageScore,
    evidenceStrengthScore,
    adjacentSkillSupportScore,
    planReadinessScore,
    requiredCoverageMax: REQUIRED_COVERAGE_MAX,
    preferredCoverageMax: PREFERRED_COVERAGE_MAX,
    evidenceStrengthMax: EVIDENCE_STRENGTH_MAX,
    adjacentSkillSupportMax: ADJACENT_SKILL_SUPPORT_MAX,
    planReadinessMax: PLAN_READINESS_MAX,
    totalBeforeRounding,
    finalScore: Math.round(totalBeforeRounding)
  };
}

export function verdictForScore(score: number): string {
  if (score >= 78) {
    return "十分に近い。証拠を整えれば強く見せられる";
  }

  if (score >= 62) {
    return "到達圏内。証拠づくりを集中して進める";
  }

  if (score >= 45) {
    return "準備余地が大きい。必須要件から補強する";
  }

  return "現時点では距離がある。近い職種か基礎証拠から整える";
}

function weightedCoverageScore(coverageRows: RequirementCoverage[], maxScore: number): number {
  if (coverageRows.length === 0) {
    return 0;
  }

  const totalWeight = coverageRows.reduce((sum, coverage) => sum + coverage.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  const weightedValue = coverageRows.reduce(
    (sum, coverage) => sum + coverageStatusValues[coverage.status] * coverage.weight,
    0
  );

  return (weightedValue / totalWeight) * maxScore;
}

function weightedEvidenceScore(
  coverageRows: RequirementCoverage[],
  maxScore: number
): number {
  if (coverageRows.length === 0) {
    return 0;
  }

  const totalWeight = coverageRows.reduce((sum, coverage) => sum + coverage.weight, 0);
  const weightedValue = coverageRows.reduce(
    (sum, coverage) =>
      sum + evidenceStrengthValues[coverage.evidenceStrength] * coverage.weight,
    0
  );

  return (weightedValue / totalWeight) * maxScore;
}

function adjacentSkillSupportScoreFor(coverageRows: RequirementCoverage[]): number {
  const supportableRows = coverageRows.filter((coverage) => coverage.status !== "matched");
  if (supportableRows.length === 0) {
    return 0;
  }

  const totalWeight = supportableRows.reduce((sum, coverage) => sum + coverage.weight, 0);
  const adjacentWeight = supportableRows.reduce((sum, coverage) => {
    const hasAdjacentSkill = coverage.acceptedAdjacentSkills.length > 0;
    return sum + (hasAdjacentSkill ? coverage.weight * 0.5 : 0);
  }, 0);

  return Math.min(
    ADJACENT_SKILL_SUPPORT_MAX,
    (adjacentWeight / totalWeight) * ADJACENT_SKILL_SUPPORT_MAX
  );
}

function planReadinessScoreFor(evidenceGaps: EvidenceGap[], planWeeks: PlanWeek[]): number {
  if (planWeeks.length !== 12 || evidenceGaps.length === 0) {
    return 0;
  }

  const highPriorityGapKeys = evidenceGaps
    .filter((gap) => gap.expectedImpact === "high")
    .map((gap) => gap.gapKey);
  const linkedGapKeys = new Set(
    planWeeks.flatMap((week) =>
      week.tasks
        .map((task) => task.linkedEvidenceGapKey)
        .filter((gapKey): gapKey is string => Boolean(gapKey))
    )
  );
  const coveredHighPriorityGaps = highPriorityGapKeys.filter((gapKey) =>
    linkedGapKeys.has(gapKey)
  );
  const evidenceWeeks = planWeeks.filter((week) =>
    week.tasks.some((task) => task.evidenceToCreate.length > 0)
  );

  const gapCoverage =
    highPriorityGapKeys.length === 0
      ? 1
      : coveredHighPriorityGaps.length / highPriorityGapKeys.length;
  const weeklyDistribution = Math.min(1, evidenceWeeks.length / 8);

  return (gapCoverage * 0.7 + weeklyDistribution * 0.3) * PLAN_READINESS_MAX;
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}
