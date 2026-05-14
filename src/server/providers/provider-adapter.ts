import type { ProviderMode } from "@/lib/keikakun/types";

export interface ProviderAdapter<TInput, TOutput> {
  name: "mock" | "openai" | "anthropic";
  mode: ProviderMode;
  isConfigured(): boolean;
  run(input: TInput): Promise<TOutput>;
}

export function getConfiguredProviderName(): "mock" | "openai" | "anthropic" {
  if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }

  if (process.env.AI_PROVIDER === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }

  return "mock";
}

export function shouldUseMockFallback(error: unknown): boolean {
  if (!error) {
    return false;
  }

  return true;
}
