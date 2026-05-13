import { describe, expect, it } from "vitest";
import { buildMockSession, evaluateMockInterviewAnswer } from "@/lib/keikakun/mock-pipeline";

describe("mock pipeline", () => {
  it("builds a full public demo session without API keys", () => {
    const bundle = buildMockSession({
      sessionId: "test-session",
      visitorId: "test-visitor",
      source: "sample",
      variant: "medium-main",
      now: new Date("2026-05-15T00:00:00.000Z")
    });

    expect(bundle.session.status).toBe("completed");
    expect(bundle.plan.weeks).toHaveLength(12);
    expect(bundle.interview.questions).toHaveLength(6);
    expect(bundle.evidence.materials.length).toBeGreaterThan(0);
    expect(bundle.trace.pipelineSteps.some((step) => step.stepName === "scoreMatch")).toBe(true);
  });

  it("keeps raw text out of process trace", () => {
    const rawText = "this exact raw career phrase must never appear in trace";
    const bundle = buildMockSession({
      sessionId: "test-session",
      visitorId: "test-visitor",
      source: "manual",
      careerHistoryText: `${rawText} ${"x".repeat(250)}`,
      jobPostingText: `Product Operations ${"y".repeat(250)}`,
      now: new Date("2026-05-15T00:00:00.000Z")
    });

    expect(JSON.stringify(bundle.trace)).not.toContain(rawText);
  });

  it("evaluates an interview answer with a structured outline", () => {
    const evaluation = evaluateMockInterviewAnswer(
      "q-role-1",
      "問い合わせ20件を分類し、改善候補を3つ整理しました。"
    );

    expect(evaluation.scores.overall).toBeGreaterThan(50);
    expect(evaluation.improvedAnswerOutline).toContain("結論");
  });
});
