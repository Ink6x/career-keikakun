import { describe, expect, it } from "vitest";
import { getFixtureCase } from "@/lib/keikakun/fixtures";
import { calculateScoringBreakdown, skillRelationshipValue } from "@/lib/keikakun/scoring";

describe("scoring", () => {
  it("keeps fixture score ordering stable", () => {
    const low = scoreFixture("low-match");
    const medium = scoreFixture("medium-main");
    const high = scoreFixture("high-match");

    expect(low).toBeGreaterThanOrEqual(38);
    expect(low).toBeLessThanOrEqual(50);
    expect(medium).toBeGreaterThanOrEqual(62);
    expect(medium).toBeLessThanOrEqual(70);
    expect(high).toBeGreaterThanOrEqual(78);
    expect(high).toBeLessThanOrEqual(86);
    expect(low).toBeLessThan(medium);
    expect(medium).toBeLessThan(high);
  });

  it("caps adjacent skills at half of a direct skill match", () => {
    expect(skillRelationshipValue("matched")).toBe(1);
    expect(skillRelationshipValue("adjacent")).toBeLessThanOrEqual(0.5);
    expect(skillRelationshipValue("pending")).toBe(0);
  });

  it("keeps plan readiness at five points or less", () => {
    const fixture = getFixtureCase("medium-main");
    const breakdown = calculateScoringBreakdown(
      fixture.requirementCoverage,
      fixture.evidenceGaps,
      fixture.planWeeks
    );

    expect(breakdown.planReadinessScore).toBeLessThanOrEqual(5);
    expect(breakdown.scoreVersion).toBe("2026-05-15");
    expect(breakdown.weightVersion).toBe("2026-05-15");
  });
});

function scoreFixture(variant: "low-match" | "medium-main" | "high-match") {
  const fixture = getFixtureCase(variant);
  return calculateScoringBreakdown(
    fixture.requirementCoverage,
    fixture.evidenceGaps,
    fixture.planWeeks
  ).finalScore;
}
