import { calculateScoringBreakdown, verdictForScore } from "./scoring";
import {
  SCHEMA_VERSION,
  type AuditEvent,
  type EvidenceArtifact,
  type EvidenceMaterialStatus,
  type ProviderMode,
  type SessionBundle,
  type WeeklyReview
} from "./types";
import { getFixtureCase, type FixtureCase, type FixtureVariant } from "./fixtures";
import { encryptRawPayload, estimateTokenCount, hashText, summarizeForTrace } from "./privacy";

export interface BuildMockSessionOptions {
  sessionId: string;
  visitorId: string;
  source: "sample" | "manual";
  variant?: FixtureVariant;
  careerHistoryText?: string;
  jobPostingText?: string;
  rawStorageConsent?: boolean;
  now?: Date;
}

export function buildMockSession(options: BuildMockSessionOptions): SessionBundle {
  const fixture = getFixtureCase(options.variant ?? "medium-main");
  const careerHistoryText = options.careerHistoryText ?? fixture.careerHistoryText;
  const jobPostingText = options.jobPostingText ?? fixture.jobPostingText;
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  const scoringBreakdown = calculateScoringBreakdown(
    fixture.requirementCoverage,
    fixture.evidenceGaps,
    fixture.planWeeks
  );
  const providerMode = resolveProviderMode();
  const rawStorageStored = maybeStoreRawPayload(careerHistoryText, options.rawStorageConsent);
  const evidenceStatusCounts = countEvidenceStatus(fixture.evidenceArtifacts);
  const auditEvents = createAuditEvents(options.sessionId, timestamp, rawStorageStored);

  const session = {
    id: options.sessionId,
    status: "completed" as const,
    source: options.source,
    providerMode,
    embeddingMode: "local" as const,
    displayTargetRoleTitle: fixture.targetRole,
    extractedTargetRoleTitle: fixture.targetRole,
    schemaVersion: SCHEMA_VERSION,
    startedAt: timestamp,
    completedAt: timestamp,
    workspaceProgress: {
      reviewCount: 0,
      evidenceMaterialCount: fixture.evidenceArtifacts.length,
      readyEvidenceCount: evidenceStatusCounts.ready,
      lastActivityAt: timestamp
    }
  };

  const analyze = {
    session,
    matchAnalysis: {
      matchScore: scoringBreakdown.finalScore,
      verdictLabel: verdictForScore(scoringBreakdown.finalScore),
      scoringBreakdown,
      explanationSnapshot:
        "スコアは求人要件の充足、証拠の強さ、隣接スキル、12週間計画の準備度からコードで計算しています。"
    },
    keyFindings: fixture.keyFindings,
    requirementCoverage: fixture.requirementCoverage,
    skillMatches: fixture.skillMatches,
    evidenceGaps: fixture.evidenceGaps,
    nextAction: fixture.nextAction
  };

  return {
    session,
    input: {
      careerHistoryHash: hashText(careerHistoryText),
      jobPostingHash: hashText(jobPostingText),
      careerHistorySummary: summarizeForTrace(careerHistoryText),
      jobPostingSummary: summarizeForTrace(jobPostingText),
      rawStorageStored
    },
    analyze,
    plan: {
      targetRole: fixture.targetRole,
      planSummary:
        "12週間で、顧客インサイト、データ分析、フィードバックループ、証拠素材を順に補強する計画です。",
      currentWeek: 1,
      weeks: fixture.planWeeks
    },
    review: {
      currentWeek: 1,
      reviewHistory: [],
      openTasks: fixture.planWeeks.flatMap((week) => week.tasks).filter((task) => task.status !== "completed"),
      latestAdjustments: []
    },
    evidence: {
      materials: fixture.evidenceArtifacts,
      statusCounts: evidenceStatusCounts,
      proofTypeCounts: countEvidenceProofTypes(fixture.evidenceArtifacts)
    },
    trace: {
      pipelineSteps: createPipelineSteps(fixture, providerMode, timestamp, [
        hashText(careerHistoryText),
        hashText(jobPostingText)
      ]),
      providerCalls: [
        {
          providerName: "mock",
          providerMode,
          status: "success",
          modelName: "deterministic-fixture-medium-main",
          latencyMs: 12,
          reasonCode: providerMode === "mock" ? "no_real_provider_required" : "mock_validation_passed",
          requestMetadata: {
            careerHistoryTokenEstimate: estimateTokenCount(careerHistoryText),
            jobPostingTokenEstimate: estimateTokenCount(jobPostingText)
          },
          responseMetadata: {
            schemaVersion: SCHEMA_VERSION,
            rawPayloadIncluded: false
          }
        }
      ],
      auditEvents,
      scoringBreakdown,
      embeddingMode: "local",
      similarityUse: "adjacency_classification",
      directScoreContribution: "none"
    }
  };
}

export function createStructuredWeeklyReview(
  text: string,
  weekNumber: number,
  now = new Date()
): WeeklyReview {
  const summary = summarizeForTrace(text);

  return {
    reviewKey: `review-${weekNumber}-${hashText(text).slice(0, 8)}`,
    weekNumber,
    progressStatus: text.includes("詰ま") || text.includes("block") ? "blocked" : "on_track",
    summary,
    completedTaskKeys: [`task-${weekNumber}-1`],
    blockedTaskKeys: text.includes("SQL") ? [`task-${weekNumber}-1`] : [],
    nextActions: [
      "次回までに作った証拠が求人要件のどこに効くかを一文で書く。",
      "弱い数字は推定でよいので前後比較の形にする。"
    ],
    planAdjustments: [`${now.toISOString()} に週次レビューを反映`],
    evidenceUpdates: ["証拠素材の次アクションを更新候補に追加"]
  };
}

export function updateEvidenceArtifactStatus(
  materials: EvidenceArtifact[],
  artifactKey: string,
  status: EvidenceMaterialStatus,
  note?: string,
  nextAction?: string
): EvidenceArtifact[] {
  return materials.map((material) =>
    material.artifactKey === artifactKey
      ? {
          ...material,
          status,
          note,
          nextAction: nextAction ?? material.nextAction
        }
      : material
  );
}

function resolveProviderMode(): ProviderMode {
  const provider = process.env.AI_PROVIDER;
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    return "fallback";
  }

  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return "fallback";
  }

  return "mock";
}

function maybeStoreRawPayload(text: string, consent = false): boolean {
  if (!consent || !process.env.RAW_PAYLOAD_ENCRYPTION_KEY) {
    return false;
  }

  encryptRawPayload(
    text,
    process.env.RAW_PAYLOAD_ENCRYPTION_KEY,
    process.env.RAW_PAYLOAD_ENCRYPTION_KEY_VERSION ?? "local-v1"
  );
  return true;
}

function createPipelineSteps(
  fixture: FixtureCase,
  providerMode: ProviderMode,
  timestamp: string,
  inputHashRefs: string[]
) {
  const steps = [
    "createAnalysisSession",
    "validateInput",
    "parseProfile",
    "extractJobRequirements",
    "normalizeSkills",
    "scoreMatch",
    "generatePlan",
    "buildEvidenceBoard",
    "recordAuditEvent"
  ];

  return steps.map((stepName) => ({
    stepName,
    status: "success" as const,
    providerMode,
    embeddingMode: "local" as const,
    startedAt: timestamp,
    completedAt: timestamp,
    inputHashRefs,
    validationStatus: "passed" as const,
    summary: summaryForStep(stepName, fixture),
    errorCode: null
  }));
}

function summaryForStep(stepName: string, fixture: FixtureCase): string {
  const summaries: Record<string, string> = {
    createAnalysisSession: "匿名セッションと分析実行単位を作成しました。",
    validateInput: "入力長、raw storage consent、locale を検証しました。",
    parseProfile: fixture.profileSummary,
    extractJobRequirements: `${fixture.requirements.length}件の求人要件を抽出しました。`,
    normalizeSkills: "alias と adjacency rule でスキルを正規化しました。",
    scoreMatch: "決定論的スコアリングを実行しました。",
    generatePlan: "12週間の準備計画を作成しました。",
    buildEvidenceBoard: `${fixture.evidenceArtifacts.length}件の証拠素材を作成しました。`,
    recordAuditEvent: "trace-safe な監査イベントを記録しました。"
  };

  return summaries[stepName] ?? "step completed";
}

function createAuditEvents(
  sessionId: string,
  timestamp: string,
  rawStorageStored: boolean
): AuditEvent[] {
  return [
    {
      eventKey: "audit-session-completed",
      eventType: "analysis_completed",
      entityType: "AnalysisSession",
      entityId: sessionId,
      createdAt: timestamp,
      metadata: {
        schemaVersion: SCHEMA_VERSION,
        rawStorageStored
      }
    },
    {
      eventKey: "audit-score-calculated",
      eventType: "score_calculated",
      entityType: "MatchAnalysis",
      entityId: sessionId,
      createdAt: timestamp,
      metadata: {
        scoreVersion: "2026-05-15",
        rawInputExposed: false
      }
    }
  ];
}

function countEvidenceStatus(
  materials: EvidenceArtifact[]
): Record<EvidenceMaterialStatus, number> {
  return materials.reduce<Record<EvidenceMaterialStatus, number>>(
    (acc, material) => ({
      ...acc,
      [material.status]: acc[material.status] + 1
    }),
    {
      not_started: 0,
      in_progress: 0,
      ready: 0,
      archived: 0
    }
  );
}

function countEvidenceProofTypes(materials: EvidenceArtifact[]) {
  return materials.reduce<SessionBundle["evidence"]["proofTypeCounts"]>((acc, material) => {
    acc[material.proofType] = (acc[material.proofType] ?? 0) + 1;
    return acc;
  }, {});
}
