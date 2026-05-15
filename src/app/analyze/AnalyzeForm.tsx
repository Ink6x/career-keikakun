"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import { mediumCareerHistoryText, sampleJobPostingText } from "@/lib/keikakun/fixtures";

interface AnalyzeFormProps {
  mode: string | null;
}

const loadingSteps = [
  "Structuring career history",
  "Extracting job requirements",
  "Normalizing skills",
  "Calculating match score",
  "Creating 90-day plan"
];

export function AnalyzeForm({ mode }: AnalyzeFormProps) {
  const router = useRouter();
  const isSample = mode === "sample";
  const [careerHistoryText, setCareerHistoryText] = useState(
    isSample ? mediumCareerHistoryText : ""
  );
  const [jobPostingText, setJobPostingText] = useState(isSample ? sampleJobPostingText : "");
  const [rawStorageConsent, setRawStorageConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checks = useMemo(
    () => [
      {
        label: "職務経歴は200文字以上",
        passed: careerHistoryText.trim().length >= 200
      },
      {
        label: "求人票は200文字以上",
        passed: jobPostingText.trim().length >= 200
      },
      {
        label: "不要な個人情報は貼り付けない",
        passed: true
      }
    ],
    [careerHistoryText, jobPostingText]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!checks.every((check) => check.passed)) {
      setError("入力が短すぎます。職務経歴と求人票をそれぞれ200文字以上にしてください。");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/analysis-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerHistoryText,
        jobPostingText,
        rawStorageConsent,
        locale: "ja-JP",
        idempotencyKey: crypto.randomUUID()
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error?.message ?? "分析を開始できませんでした。");
      setIsLoading(false);
      return;
    }

    router.push(payload.data.redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">職務経歴</span>
          <textarea
            value={careerHistoryText}
            onChange={(event) => setCareerHistoryText(event.target.value)}
            className="min-h-[220px] w-full rounded-lg border border-[#c8d2e0] bg-white p-4 text-[15px] outline-none focus:ring-4 focus:ring-[rgba(40,75,125,0.18)]"
            placeholder="これまでの職務経歴、担当業務、成果、使用ツール、改善経験を貼り付けてください。"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold">求人票</span>
          <textarea
            value={jobPostingText}
            onChange={(event) => setJobPostingText(event.target.value)}
            className="min-h-[220px] w-full rounded-lg border border-[#c8d2e0] bg-white p-4 text-[15px] outline-none focus:ring-4 focus:ring-[rgba(40,75,125,0.18)]"
            placeholder="目標職種の求人票、要件、業務内容を貼り付けてください。"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          {checks.map((check) => (
            <p key={check.label} className="text-sm text-brand-muted">
              <span className={check.passed ? "text-brand-success" : "text-brand-danger"}>
                {check.passed ? "OK" : "要確認"}
              </span>{" "}
              {check.label}
            </p>
          ))}
          <label className="mt-3 flex items-start gap-3 text-sm text-brand-muted">
            <input
              type="checkbox"
              checked={rawStorageConsent}
              onChange={(event) => setRawStorageConsent(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="inline-flex gap-2">
              <LockKeyhole size={16} aria-hidden="true" />
              任意で暗号化 raw storage を有効化する。デフォルトでは raw text は保存しません。
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-brand-navy px-5 text-sm font-bold text-white disabled:opacity-70"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
          Analyze
          {!isLoading ? <ArrowRight size={16} aria-hidden="true" /> : null}
        </button>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-[#f2b8b5] bg-[#fde8e5] p-3 text-sm text-brand-danger">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-brand-border bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-brand-muted">
            AI analysis pipeline
          </p>
          <div className="grid gap-3 md:grid-cols-5">
            {loadingSteps.map((step) => (
              <div key={step} className="rounded-lg border border-brand-border bg-brand-surface p-3 text-sm">
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
