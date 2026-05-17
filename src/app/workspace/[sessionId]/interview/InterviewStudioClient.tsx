"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonClassName } from "@/components/ui/Button";
import type { InterviewEvaluation, InterviewQuestion } from "@/lib/keikakun/types";

interface InterviewStudioClientProps {
  sessionId: string;
  questions: InterviewQuestion[];
}

export function InterviewStudioClient({ sessionId, questions }: InterviewStudioClientProps) {
  const [selectedQuestionKey, setSelectedQuestionKey] = useState(questions[0]?.questionKey ?? "");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedQuestion = useMemo(
    () =>
      questions.find((question) => question.questionKey === selectedQuestionKey) ?? questions[0],
    [questions, selectedQuestionKey]
  );

  async function submitAnswer() {
    if (!selectedQuestion) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const response = await fetch(`/api/analysis-sessions/${sessionId}/interview-answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interviewQuestionId: selectedQuestion.questionKey,
        interviewAnswerText: answer,
        rawStorageConsent: false
      })
    });
    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "回答を評価できませんでした。");
      return;
    }

    setEvaluation(payload.data.evaluation);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-card border border-brand-border bg-brand-surface p-4 sm:p-5">
        <p className="mb-4 text-sm font-semibold text-brand-muted">初期 6 問</p>
        <div className="space-y-2">
          {questions.map((question) => (
            <button
              key={question.questionKey}
              type="button"
              onClick={() => {
                setSelectedQuestionKey(question.questionKey);
                setEvaluation(null);
              }}
              className={`w-full rounded-card border p-4 text-left text-sm transition ${
                selectedQuestionKey === question.questionKey
                  ? "border-brand-ink bg-brand-surface-alt"
                  : "border-brand-border bg-brand-surface hover:bg-brand-surface-alt"
              }`}
            >
              <div className="mb-2">
                <StatusBadge kind="process">{question.category}</StatusBadge>
              </div>
              <p className="font-semibold leading-[1.6] text-brand-ink">{question.question}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
        {selectedQuestion ? (
          <>
            <StatusBadge kind="process">{selectedQuestion.category}</StatusBadge>
            <h2 className="heading mt-3 text-card-title font-bold text-brand-ink">
              {selectedQuestion.question}
            </h2>
            <p className="mt-2 text-sm leading-[1.8] text-brand-muted">
              評価観点: {selectedQuestion.evaluationFocus}
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">回答</span>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="min-h-[160px] w-full rounded-card border border-brand-border bg-white p-4 text-[15px] leading-[1.8] outline-none focus:ring-4 focus:ring-brand-primary-soft sm:min-h-[200px] md:min-h-[220px]"
                placeholder="STAR を意識して、状況・行動・結果・次の改善を含めて答えてください。"
              />
            </label>

            {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}

            <button
              type="button"
              onClick={submitAnswer}
              disabled={isSubmitting || answer.trim().length < 20}
              className={buttonClassName("primary", "mt-5 w-full sm:w-auto")}
            >
              <Send size={16} aria-hidden="true" />
              回答を評価
            </button>

            {evaluation ? (
              <div className="mt-6 grid gap-4 md:grid-cols-[minmax(200px,240px)_1fr]">
                <div className="rounded-card border border-brand-border p-5">
                  <p className="text-sm font-semibold text-brand-muted">総合</p>
                  <p className="mt-2 font-mono text-score font-bold text-brand-ink">
                    {evaluation.scores.overall}
                  </p>
                  <dl className="mt-4 space-y-2 text-sm leading-[1.8]">
                    <Score label="具体性" value={evaluation.scores.specificity} />
                    <Score label="役割適合" value={evaluation.scores.roleRelevance} />
                    <Score label="証拠の強さ" value={evaluation.scores.evidenceStrength} />
                  </dl>
                </div>
                <div className="space-y-4 rounded-card border border-brand-border p-5">
                  <div>
                    <p className="font-bold text-brand-ink">弱点</p>
                    <ul className="mt-2 list-inside list-disc text-sm leading-[1.8] text-brand-muted">
                      {evaluation.improvementPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink">改稿アウトライン</p>
                    <p className="mt-2 text-sm leading-[1.8] text-brand-muted">
                      {evaluation.improvedAnswerOutline}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-brand-ink">{label}</dt>
      <dd className="font-mono text-brand-muted">{value}</dd>
    </div>
  );
}
