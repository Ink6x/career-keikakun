"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Loader2 } from "lucide-react";
import { mediumCareerHistoryText, sampleJobPostingText } from "@/lib/keikakun/fixtures";
import { buttonClassName } from "@/components/ui/Button";

interface AnalyzeFormProps {
  mode: string | null;
}

const loadingSteps = [
  "職務経歴の構造化",
  "求人要件の抽出",
  "スキル正規化",
  "マッチスコア算出",
  "90日プラン生成"
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

  const textareaClass =
    "min-h-[160px] w-full rounded-card border border-brand-border bg-white p-4 text-[15px] leading-[1.8] outline-none focus:ring-4 focus:ring-brand-primary-soft sm:min-h-[200px] md:min-h-[220px]";

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-brand-ink">職務経歴</span>
        <textarea
          value={careerHistoryText}
          onChange={(event) => setCareerHistoryText(event.target.value)}
          className={textareaClass}
          placeholder="これまでの職務経歴、担当業務、成果、使用ツール、改善経験を貼り付けてください。"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-brand-ink">求人票</span>
        <textarea
          value={jobPostingText}
          onChange={(event) => setJobPostingText(event.target.value)}
          className={textareaClass}
          placeholder="目標職種の求人票、要件、業務内容を貼り付けてください。"
        />
      </label>

      <div className="rounded-card border border-brand-border bg-white p-5">
        <div className="space-y-2">
          {checks.map((check) => (
            <p key={check.label} className="text-sm leading-[1.8] text-brand-muted">
              <span
                className={`mr-1 font-semibold ${
                  check.passed ? "text-brand-success" : "text-brand-danger"
                }`}
              >
                {check.passed ? "OK" : "要確認"}
              </span>
              {check.label}
            </p>
          ))}
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm leading-[1.8] text-brand-muted">
          <input
            type="checkbox"
            checked={rawStorageConsent}
            onChange={(event) => setRawStorageConsent(event.target.checked)}
            className="mt-1.5 h-4 w-4 accent-brand-primary"
          />
          <span className="inline-flex items-start gap-2">
            <LockKeyhole size={16} aria-hidden="true" className="mt-1 shrink-0" />
            <span>
              任意で暗号化 raw storage を有効化する。デフォルトでは raw text を保存しません。
            </span>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={buttonClassName("primary", "w-full sm:w-auto sm:min-w-[240px] sm:ml-auto sm:flex")}
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
        分析を開始
        {!isLoading ? <ArrowRight size={16} aria-hidden="true" /> : null}
      </button>

      {error ? (
        <p
          role="alert"
          className="rounded-card border border-brand-border bg-brand-danger-soft p-4 text-sm text-brand-danger"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-card border border-brand-border bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-brand-muted">AI 分析パイプライン</p>
          <ul className="space-y-2">
            {loadingSteps.map((step) => (
              <li
                key={step}
                className="rounded-button border border-brand-border bg-brand-surface-alt px-4 py-3 text-sm leading-[1.6] text-brand-ink"
              >
                {step}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
