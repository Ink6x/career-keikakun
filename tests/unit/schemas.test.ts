import { describe, expect, it } from "vitest";
import {
  GenerateInterviewSetOutputSchema,
  GeneratePlanOutputSchema,
  ParseProfileOutputSchema,
  StartAnalysisRequestSchema
} from "@/lib/keikakun/schemas";
import { SCHEMA_VERSION } from "@/lib/keikakun/types";

describe("schemas", () => {
  it("rejects short analysis input", () => {
    expect(() =>
      StartAnalysisRequestSchema.parse({
        careerHistoryText: "short",
        jobPostingText: "short",
        rawStorageConsent: false
      })
    ).toThrow();
  });

  it("rejects generic provider confidence fields", () => {
    expect(() =>
      ParseProfileOutputSchema.parse({
        schemaVersion: SCHEMA_VERSION,
        locale: "ja-JP",
        warnings: [],
        profileSummary: "summary",
        currentRole: "CS",
        estimatedYearsExperience: 3,
        structuredExperience: [
          {
            experienceKey: "exp-1",
            companyOrProject: "synthetic",
            role: "CS",
            periodLabel: "3 years",
            responsibilities: ["support"],
            outcomes: [],
            technologies: [],
            sourceReferences: []
          }
        ],
        skills: [
          {
            skillKey: "skill-1",
            name: "customer success",
            category: "business",
            evidenceReferences: [],
            recencySignal: "recent",
            proficiencySignal: "used at work"
          }
        ],
        achievements: [],
        interviewExamples: [],
        inputSummary: "safe summary",
        confidence: 0.9
      })
    ).toThrow();
  });

  it("requires exactly 12 plan weeks", () => {
    expect(() =>
      GeneratePlanOutputSchema.parse({
        schemaVersion: SCHEMA_VERSION,
        locale: "ja-JP",
        warnings: [],
        targetRole: "Product Ops",
        planSummary: "plan",
        weeks: []
      })
    ).toThrow();
  });

  it("requires fixed interview question distribution", () => {
    expect(() =>
      GenerateInterviewSetOutputSchema.parse({
        schemaVersion: SCHEMA_VERSION,
        locale: "ja-JP",
        warnings: [],
        questions: Array.from({ length: 6 }, (_, index) => ({
          questionKey: `q-${index}`,
          question: "質問です",
          category: "behavioral",
          linkedRequirementKey: null,
          linkedEvidenceGapKey: null,
          evaluationFocus: "specificity"
        }))
      })
    ).toThrow();
  });
});
