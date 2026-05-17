"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { PlanTask, WeeklyReview } from "@/lib/keikakun/types";
import { buttonClassName } from "@/components/ui/Button";

interface ReviewClientProps {
  sessionId: string;
  weekNumber: number;
  openTasks: PlanTask[];
}

export function ReviewClient({ sessionId, weekNumber, openTasks }: ReviewClientProps) {
  const [text, setText] = useState("");
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview() {
    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/analysis-sessions/${sessionId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekNumber,
        weeklyReviewText: text,
        rawStorageConsent: false
      })
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "レビューを構造化できませんでした。");
      return;
    }

    setReview(payload.data.structuredReview);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div className="rounded-card bg-brand-surface-alt p-4 sm:p-5">
          <p className="text-sm font-semibold text-brand-ink">コーチ</p>
          <p className="mt-2 leading-[1.9] text-brand-ink">
            今週作った証拠、詰まった点、次にやることをまとめてください。弱い証拠は弱いままで構いません。
            どこが弱いかを見える化することが目的です。
          </p>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold text-brand-ink">今週のレビュー</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[160px] w-full rounded-card border border-brand-border bg-white p-4 text-[15px] leading-[1.8] outline-none focus:ring-4 focus:ring-brand-primary-soft sm:min-h-[200px] md:min-h-[220px]"
            placeholder="例: 問い合わせ20件を分類したが、SQLの集計で詰まった。次は頻度と影響度で優先度をつけたい。"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}

        <button
          type="button"
          onClick={submitReview}
          disabled={isSubmitting || text.trim().length < 20}
          className={buttonClassName("primary", "mt-5 w-full sm:w-auto")}
        >
          <Send size={16} aria-hidden="true" />
          レビューを構造化
        </button>
      </section>

      <aside className="space-y-4">
        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <p className="text-sm font-semibold text-brand-muted">選択中の週</p>
          <h2 className="heading mt-2 text-card-title font-bold text-brand-ink">
            Week {weekNumber}
          </h2>
          <div className="mt-4 space-y-3">
            {openTasks.slice(0, 3).map((task) => (
              <div
                key={task.taskKey}
                className="rounded-card border border-brand-border p-4 text-sm leading-[1.8]"
              >
                <p className="font-semibold text-brand-ink">{task.title}</p>
                <p className="mt-1 text-brand-muted">{task.evidenceToCreate}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <p className="text-sm font-semibold text-brand-muted">構造化結果</p>
          {review ? (
            <div className="mt-3 space-y-3 text-sm leading-[1.8]">
              <p className="text-brand-ink">{review.summary}</p>
              <p className="font-semibold text-brand-ink">進捗: {review.progressStatus}</p>
              <ul className="list-inside list-disc text-brand-muted">
                {review.nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-[1.8] text-brand-muted">
              レビュー送信後、構造化された進捗・ブロッカー・次アクションがここに表示されます。
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
