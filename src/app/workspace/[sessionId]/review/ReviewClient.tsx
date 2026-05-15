"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { PlanTask, WeeklyReview } from "@/lib/keikakun/types";

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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-lg border border-brand-border bg-white p-5">
        <div className="rounded-lg bg-brand-surface p-4">
          <p className="text-sm font-bold text-brand-navy">Coach</p>
          <p className="mt-2">
            今週作った証拠、詰まった点、次にやることをまとめてください。弱い証拠は弱いままで構いません。
            どこが弱いかを見える化することが目的です。
          </p>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold">今週のレビュー</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-[220px] w-full rounded-lg border border-[#c8d2e0] p-4 outline-none focus:ring-4 focus:ring-[rgba(40,75,125,0.18)]"
            placeholder="例: 問い合わせ20件を分類したが、SQLの集計で詰まった。次は頻度と影響度で優先度をつけたい。"
          />
        </label>

        {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}

        <button
          type="button"
          onClick={submitReview}
          disabled={isSubmitting || text.trim().length < 20}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-navy px-4 text-sm font-bold text-white disabled:opacity-60"
        >
          <Send size={16} aria-hidden="true" />
          Apply review
        </button>
      </section>

      <aside className="space-y-4">
        <section className="rounded-lg border border-brand-border bg-white p-5">
          <p className="text-sm font-bold text-brand-muted">Selected week</p>
          <h2 className="mt-2 text-xl font-bold">Week {weekNumber}</h2>
          <div className="mt-4 space-y-3">
            {openTasks.slice(0, 3).map((task) => (
              <div key={task.taskKey} className="rounded-lg border border-brand-border p-3 text-sm">
                <p className="font-semibold">{task.title}</p>
                <p className="mt-1 text-brand-muted">{task.evidenceToCreate}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-brand-border bg-white p-5">
          <p className="text-sm font-bold text-brand-muted">Structured result</p>
          {review ? (
            <div className="mt-3 space-y-3 text-sm">
              <p>{review.summary}</p>
              <p className="font-semibold">Status: {review.progressStatus}</p>
              <ul className="list-inside list-disc text-brand-muted">
                {review.nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm text-brand-muted">
              レビュー送信後、構造化された進捗、blocker、次アクションがここに表示されます。
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
