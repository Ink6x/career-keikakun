import {
  buildMockSession,
  createStructuredWeeklyReview,
  evaluateMockInterviewAnswer,
  updateEvidenceArtifactStatus
} from "@/lib/keikakun/mock-pipeline";
import type {
  EvidenceMaterialStatus,
  InterviewEvaluation,
  SessionBundle,
  WeeklyReview
} from "@/lib/keikakun/types";
import type { StartAnalysisRequest } from "@/lib/keikakun/schemas";

interface StoreState {
  sessions: Map<string, SessionBundle>;
  owners: Map<string, string>;
  idempotency: Map<string, string>;
}

const globalStore = globalThis as typeof globalThis & {
  __keikakunStore?: StoreState;
};

function store(): StoreState {
  if (!globalStore.__keikakunStore) {
    globalStore.__keikakunStore = {
      sessions: new Map(),
      owners: new Map(),
      idempotency: new Map()
    };
  }

  return globalStore.__keikakunStore;
}

export function createAnalysisSession(
  input: StartAnalysisRequest,
  visitorId: string
): SessionBundle {
  const state = store();
  const idempotencyKey = input.idempotencyKey
    ? `${visitorId}:${input.idempotencyKey}`
    : undefined;

  if (idempotencyKey) {
    const existingSessionId = state.idempotency.get(idempotencyKey);
    const existing = existingSessionId ? state.sessions.get(existingSessionId) : undefined;

    if (existing) {
      return existing;
    }
  }

  const sessionId = `session-${crypto.randomUUID()}`;
  const bundle = buildMockSession({
    sessionId,
    visitorId,
    source: input.careerHistoryText.includes("BtoB SaaS") ? "sample" : "manual",
    careerHistoryText: input.careerHistoryText,
    jobPostingText: input.jobPostingText,
    rawStorageConsent: input.rawStorageConsent
  });

  state.sessions.set(sessionId, bundle);
  state.owners.set(sessionId, visitorId);

  if (idempotencyKey) {
    state.idempotency.set(idempotencyKey, sessionId);
  }

  return bundle;
}

export function getSessionForVisitor(
  sessionId: string,
  visitorId?: string
): SessionBundle | null {
  const state = store();
  const existing = state.sessions.get(sessionId);

  if (existing) {
    const owner = state.owners.get(sessionId);
    if (visitorId && owner && owner !== visitorId) {
      return null;
    }

    return existing;
  }

  if (sessionId === "demo" || sessionId === "medium-main") {
    const bundle = buildMockSession({
      sessionId,
      visitorId: visitorId ?? "visitor-demo",
      source: "sample",
      variant: "medium-main",
      now: new Date("2026-05-15T08:00:00.000Z")
    });

    state.sessions.set(sessionId, bundle);
    state.owners.set(sessionId, visitorId ?? "visitor-demo");
    return bundle;
  }

  return null;
}

export function appendWeeklyReview(
  sessionId: string,
  visitorId: string,
  weekNumber: number,
  weeklyReviewText: string
): WeeklyReview | null {
  const bundle = getSessionForVisitor(sessionId, visitorId);
  if (!bundle) {
    return null;
  }

  const review = createStructuredWeeklyReview(weeklyReviewText, weekNumber);
  const updatedBundle: SessionBundle = {
    ...bundle,
    review: {
      ...bundle.review,
      reviewHistory: [...bundle.review.reviewHistory, review],
      latestAdjustments: review.planAdjustments
    },
    session: {
      ...bundle.session,
      workspaceProgress: {
        ...bundle.session.workspaceProgress,
        reviewCount: bundle.session.workspaceProgress.reviewCount + 1,
        lastActivityAt: new Date().toISOString()
      }
    }
  };

  store().sessions.set(sessionId, updatedBundle);
  return review;
}

export function appendInterviewEvaluation(
  sessionId: string,
  visitorId: string,
  questionKey: string,
  answerText: string
): InterviewEvaluation | null {
  const bundle = getSessionForVisitor(sessionId, visitorId);
  if (!bundle) {
    return null;
  }

  const evaluation = evaluateMockInterviewAnswer(questionKey, answerText);
  const updatedBundle: SessionBundle = {
    ...bundle,
    interview: {
      ...bundle.interview,
      evaluations: [...bundle.interview.evaluations, evaluation]
    },
    session: {
      ...bundle.session,
      workspaceProgress: {
        ...bundle.session.workspaceProgress,
        evaluatedAnswerCount: bundle.session.workspaceProgress.evaluatedAnswerCount + 1,
        lastActivityAt: new Date().toISOString()
      }
    }
  };

  store().sessions.set(sessionId, updatedBundle);
  return evaluation;
}

export function updateEvidenceMaterial(
  sessionId: string,
  visitorId: string,
  artifactKey: string,
  status: EvidenceMaterialStatus,
  note?: string,
  nextAction?: string
) {
  const bundle = getSessionForVisitor(sessionId, visitorId);
  if (!bundle) {
    return null;
  }

  const materials = updateEvidenceArtifactStatus(
    bundle.evidence.materials,
    artifactKey,
    status,
    note,
    nextAction
  );
  const statusCounts = materials.reduce<SessionBundle["evidence"]["statusCounts"]>(
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
  const updatedMaterial = materials.find((material) => material.artifactKey === artifactKey);

  const updatedBundle: SessionBundle = {
    ...bundle,
    evidence: {
      ...bundle.evidence,
      materials,
      statusCounts
    },
    session: {
      ...bundle.session,
      workspaceProgress: {
        ...bundle.session.workspaceProgress,
        readyEvidenceCount: statusCounts.ready,
        lastActivityAt: new Date().toISOString()
      }
    }
  };

  store().sessions.set(sessionId, updatedBundle);
  return updatedMaterial ?? null;
}
