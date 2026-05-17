export const SCHEMA_VERSION = "2026-05-15";
export const SCORE_VERSION = "2026-05-15";
export const WEIGHT_VERSION = "2026-05-15";

export type ProviderMode = "real" | "fallback" | "mock";
export type EmbeddingMode = "local" | "provider" | "disabled";
export type AnalysisSessionStatus =
  | "draft"
  | "validating_input"
  | "running"
  | "provider_fallback"
  | "completed"
  | "validation_error"
  | "failed";
export type PipelineStepStatus =
  | "pending"
  | "running"
  | "success"
  | "fallback"
  | "validation_error"
  | "failed"
  | "skipped";
export type ValidationStatus = "passed" | "failed";
export type RequirementType = "required" | "preferred";
export type RequirementCategory =
  | "engineering"
  | "ai"
  | "data"
  | "product"
  | "design"
  | "cloud"
  | "devops"
  | "collaboration"
  | "leadership"
  | "domain"
  | "language"
  | "process"
  | "other";
export type SkillCategory =
  | "frontend"
  | "backend"
  | "ai"
  | "data"
  | "cloud"
  | "devops"
  | "product"
  | "business"
  | "design"
  | "collaboration"
  | "language"
  | "other";
export type SkillRelationship = "matched" | "adjacent" | "missing" | "pending";
export type CoverageStatus = "matched" | "partial" | "missing";
export type EvidenceStrength = "strong" | "moderate" | "weak" | "none";
export type Difficulty = "low" | "medium" | "high";
export type Impact = "low" | "medium" | "high";
export type PlanWeekStatus = "not_started" | "in_progress" | "completed" | "skipped";
export type PlanTaskStatus = "not_started" | "in_progress" | "completed" | "skipped";
export type EvidenceProofType =
  | "case_study"
  | "measurable_result"
  | "work_sample"
  | "project_demo"
  | "process_document"
  | "technical_note";
export type EvidenceMaterialStatus = "not_started" | "in_progress" | "ready" | "archived";
export type EvidenceSource = "analysis" | "plan" | "review";
export type ReviewProgressStatus = "on_track" | "blocked" | "adjusted";

export interface AnalysisSessionSummary {
  id: string;
  status: AnalysisSessionStatus;
  source: "sample" | "manual";
  providerMode: ProviderMode;
  embeddingMode: EmbeddingMode;
  displayTargetRoleTitle: string;
  extractedTargetRoleTitle: string;
  schemaVersion: string;
  startedAt: string;
  completedAt: string;
  workspaceProgress: {
    reviewCount: number;
    evidenceMaterialCount: number;
    readyEvidenceCount: number;
    lastActivityAt: string | null;
  };
}

export interface JobRequirement {
  requirementKey: string;
  normalizedText: string;
  type: RequirementType;
  category: RequirementCategory;
  priority: number;
  weight: number;
  sourceReference: string;
  requiredSkills: string[];
}

export interface RequirementCoverage {
  requirementKey: string;
  requirement: string;
  type: RequirementType;
  status: CoverageStatus;
  weight: number;
  evidenceStrength: EvidenceStrength;
  evidenceFromProfile: string[];
  gapNote: string;
  acceptedAdjacentSkills: string[];
}

export interface EvidenceGap {
  gapKey: string;
  linkedRequirementKey: string | null;
  title: string;
  whyItMatters: string;
  evidenceToCreate: string;
  difficulty: Difficulty;
  expectedImpact: Impact;
}

export interface KeyFinding {
  group: "strength" | "priority_gap" | "evidence_needed";
  title: string;
  detail: string;
}

export interface SkillMatch {
  skillMatchKey: string;
  canonicalSkill: string | null;
  relationship: SkillRelationship;
  source: "profile" | "requirement";
  evidenceReferences: string[];
  adjacencyScore?: number;
  basis: string;
}

export interface ScoringBreakdown {
  scoreVersion: string;
  weightVersion: string;
  requiredCoverageScore: number;
  preferredCoverageScore: number;
  evidenceStrengthScore: number;
  adjacentSkillSupportScore: number;
  planReadinessScore: number;
  requiredCoverageMax: 45;
  preferredCoverageMax: 15;
  evidenceStrengthMax: 25;
  adjacentSkillSupportMax: 10;
  planReadinessMax: 5;
  totalBeforeRounding: number;
  finalScore: number;
}

export interface MatchAnalysis {
  matchScore: number;
  verdictLabel: string;
  scoringBreakdown: ScoringBreakdown;
  explanationSnapshot: string;
}

export interface PlanTask {
  taskKey: string;
  title: string;
  evidenceToCreate: string;
  linkedRequirementKey: string | null;
  linkedEvidenceGapKey: string | null;
  status: PlanTaskStatus;
}

export interface PlanWeek {
  weekKey: string;
  weekNumber: number;
  objective: string;
  reviewPrompt: string;
  status: PlanWeekStatus;
  tasks: PlanTask[];
}

export interface CareerPlan {
  targetRole: string;
  planSummary: string;
  currentWeek: number;
  weeks: PlanWeek[];
}

export interface EvidenceArtifact {
  artifactKey: string;
  proofType: EvidenceProofType;
  title: string;
  sourceRequirementKey: string | null;
  sourceEvidenceGapKey: string | null;
  whyItMatters: string;
  evidenceToCreate: string;
  nextAction: string;
  source: EvidenceSource;
  targetWeek: number | null;
  status: EvidenceMaterialStatus;
  note?: string;
}

export interface WeeklyReview {
  reviewKey: string;
  weekNumber: number;
  progressStatus: ReviewProgressStatus;
  summary: string;
  completedTaskKeys: string[];
  blockedTaskKeys: string[];
  nextActions: string[];
  planAdjustments: string[];
  evidenceUpdates: string[];
}

export interface PipelineStep {
  stepName: string;
  status: PipelineStepStatus;
  providerMode: ProviderMode;
  embeddingMode: EmbeddingMode;
  startedAt: string;
  completedAt: string;
  inputHashRefs: string[];
  validationStatus: ValidationStatus;
  summary: string;
  errorCode: string | null;
}

export interface ProviderCallTrace {
  providerName: "mock" | "openai" | "anthropic";
  providerMode: ProviderMode;
  status: "success" | "fallback" | "skipped" | "failed";
  modelName: string;
  latencyMs: number;
  reasonCode: string | null;
  requestMetadata: Record<string, string | number | boolean>;
  responseMetadata: Record<string, string | number | boolean>;
}

export interface AuditEvent {
  eventKey: string;
  eventType: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface ProcessTrace {
  pipelineSteps: PipelineStep[];
  providerCalls: ProviderCallTrace[];
  auditEvents: AuditEvent[];
  scoringBreakdown: ScoringBreakdown;
  embeddingMode: EmbeddingMode;
  similarityUse: "adjacency_classification";
  directScoreContribution: "none";
}

export interface AnalyzeView {
  session: AnalysisSessionSummary;
  matchAnalysis: MatchAnalysis;
  keyFindings: KeyFinding[];
  requirementCoverage: RequirementCoverage[];
  skillMatches: SkillMatch[];
  evidenceGaps: EvidenceGap[];
  nextAction: string;
}

export interface SessionBundle {
  session: AnalysisSessionSummary;
  input: {
    careerHistoryHash: string;
    jobPostingHash: string;
    careerHistorySummary: string;
    jobPostingSummary: string;
    rawStorageStored: boolean;
  };
  analyze: AnalyzeView;
  plan: CareerPlan;
  review: {
    currentWeek: number;
    reviewHistory: WeeklyReview[];
    openTasks: PlanTask[];
    latestAdjustments: string[];
  };
  evidence: {
    materials: EvidenceArtifact[];
    statusCounts: Record<EvidenceMaterialStatus, number>;
    proofTypeCounts: Partial<Record<EvidenceProofType, number>>;
  };
  trace: ProcessTrace;
}
