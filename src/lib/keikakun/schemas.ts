import { z } from "zod";
import { SCHEMA_VERSION } from "./types";

const shortText = z.string().trim().min(1).max(120);
const summaryText = z.string().trim().min(1).max(600);

export const StartAnalysisRequestSchema = z
  .object({
    careerHistoryText: z.string().min(200).max(30000),
    jobPostingText: z.string().min(200).max(30000),
    rawStorageConsent: z.boolean().default(false),
    locale: z.string().default("ja-JP"),
    idempotencyKey: z.string().min(8).max(120).optional()
  })
  .strict();

export const SubmitWeeklyReviewRequestSchema = z
  .object({
    analysisSessionId: z.string().min(1),
    careerPlanId: z.string().min(1).optional(),
    weekNumber: z.number().int().min(1).max(12),
    weeklyReviewText: z.string().min(20).max(4000),
    rawStorageConsent: z.boolean().default(false)
  })
  .strict();

export const UpdateEvidenceMaterialRequestSchema = z
  .object({
    analysisSessionId: z.string().min(1),
    evidenceArtifactId: z.string().min(1),
    status: z.enum(["not_started", "in_progress", "ready", "archived"]),
    note: z.string().max(2000).optional(),
    nextAction: z.string().min(1).max(300).optional()
  })
  .strict();

const envelope = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    locale: z.string().default("ja-JP"),
    warnings: z.array(z.string()).default([])
  })
  .strict();

export const ParseProfileOutputSchema = envelope
  .extend({
    profileSummary: summaryText,
    currentRole: shortText,
    estimatedYearsExperience: z.number().min(0).max(60),
    structuredExperience: z
      .array(
        z
          .object({
            experienceKey: z.string().min(1),
            companyOrProject: shortText,
            role: shortText,
            periodLabel: shortText,
            responsibilities: z.array(shortText).min(1),
            outcomes: z.array(shortText).default([]),
            technologies: z.array(shortText).default([]),
            sourceReferences: z.array(shortText).default([])
          })
          .strict()
      )
      .min(1),
    skills: z
      .array(
        z
          .object({
            skillKey: z.string().min(1),
            name: shortText,
            category: z.string().min(1).max(80),
            evidenceReferences: z.array(shortText).default([]),
            recencySignal: shortText,
            proficiencySignal: shortText
          })
          .strict()
      )
      .min(1),
    achievements: z.array(summaryText).default([]),
    inputSummary: summaryText
  })
  .strict();

export const ExtractJobRequirementsOutputSchema = envelope
  .extend({
    roleTitle: shortText,
    jobSummary: summaryText,
    responsibilities: z.array(shortText).min(1),
    expectedOutcomes: z.array(shortText).default([]),
    requirements: z
      .array(
        z
          .object({
            requirementKey: z.string().min(1),
            normalizedText: shortText,
            type: z.enum(["required", "preferred"]),
            category: z.enum([
              "engineering",
              "ai",
              "data",
              "product",
              "design",
              "cloud",
              "devops",
              "collaboration",
              "leadership",
              "domain",
              "language",
              "process",
              "other"
            ]),
            prioritySignal: z.number().int().min(1).max(5),
            sourceReference: shortText
          })
          .strict()
      )
      .min(1)
  })
  .strict();

export const GeneratePlanOutputSchema = envelope
  .extend({
    targetRole: shortText,
    planSummary: summaryText,
    weeks: z
      .array(
        z
          .object({
            weekKey: z.string().min(1),
            weekNumber: z.number().int().min(1).max(12),
            objective: shortText,
            reviewPrompt: z.string().min(1).max(300),
            tasks: z
              .array(
                z
                  .object({
                    taskKey: z.string().min(1),
                    title: shortText,
                    evidenceToCreate: z.string().min(1).max(300),
                    linkedRequirementKey: z.string().nullable(),
                    linkedEvidenceGapKey: z.string().nullable(),
                    status: z.enum(["not_started", "in_progress", "completed", "skipped"])
                  })
                  .strict()
              )
              .min(1)
          })
          .strict()
      )
      .length(12)
  })
  .strict()
  .superRefine((value, ctx) => {
    const weekNumbers = new Set(value.weeks.map((week) => week.weekNumber));
    if (weekNumbers.size !== 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Plan must contain each week number exactly once."
      });
    }
  });

export type StartAnalysisRequest = z.infer<typeof StartAnalysisRequestSchema>;
