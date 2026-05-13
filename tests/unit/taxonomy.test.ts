import { describe, expect, it } from "vitest";
import {
  CANONICAL_SKILLS,
  classifySkillRelationship,
  normalizeSkillMention
} from "@/lib/keikakun/taxonomy";

describe("skill taxonomy", () => {
  it("seeds a balanced 80-120 skill taxonomy", () => {
    expect(CANONICAL_SKILLS.length).toBeGreaterThanOrEqual(80);
    expect(CANONICAL_SKILLS.length).toBeLessThanOrEqual(120);
  });

  it("maps aliases deterministically", () => {
    expect(normalizeSkillMention("TS")).toMatchObject({
      canonicalName: "TypeScript",
      relationship: "matched"
    });
    expect(normalizeSkillMention("要件定義")).toMatchObject({
      canonicalName: "requirement definition",
      relationship: "matched"
    });
  });

  it("retains unknown skills as pending records", () => {
    expect(normalizeSkillMention("未定義の独自業務スキル")).toMatchObject({
      canonicalName: null,
      relationship: "pending"
    });
  });

  it("uses explicit adjacency rules instead of raw similarity scoring", () => {
    expect(classifySkillRelationship("React", "Next.js")).toMatchObject({
      relationship: "adjacent"
    });
    expect(classifySkillRelationship("React", "SQL")).toMatchObject({
      relationship: "missing"
    });
  });
});
