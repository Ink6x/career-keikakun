import { describe, expect, it } from "vitest";
import {
  encryptRawPayload,
  estimateTokenCount,
  hashText,
  summarizeForTrace
} from "@/lib/keikakun/privacy";

describe("privacy utilities", () => {
  it("hashes raw text deterministically", () => {
    expect(hashText("same")).toBe(hashText("same"));
    expect(hashText("same")).not.toBe(hashText("different"));
  });

  it("summarizes without exceeding trace-safe length", () => {
    const summary = summarizeForTrace("a".repeat(300));
    expect(summary.length).toBeLessThanOrEqual(180);
  });

  it("encrypts raw payload without plaintext in ciphertext", () => {
    const encrypted = encryptRawPayload("sensitive career history", "local-test-secret");
    expect(encrypted.ciphertext).not.toContain("sensitive");
    expect(encrypted.nonce.length).toBeGreaterThan(0);
    expect(encrypted.authTag.length).toBeGreaterThan(0);
  });

  it("estimates token count for mixed Japanese and English input", () => {
    expect(estimateTokenCount("顧客要望を整理 SQL BI")).toBeGreaterThan(1);
  });
});
