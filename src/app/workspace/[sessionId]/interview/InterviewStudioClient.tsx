"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
    () => questions.find((question) => question.questionKey === selectedQuestionKey) ?? questions[0],
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
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-brand-border bg-white p-4">
        <p className="mb-3 text-sm font-bold text-brand-muted">Initial 6 questions</p>
        <div className="space-y-2">
          {questions.map((question) => (
            <button
              key={question.questionKey}
              type="button"
              onClick={() => {
                setSelectedQuestionKey(question.questionKey);
                setEvaluation(null);
              }}
              className={`w-full rounded-lg border p-3 text-left text-sm ${
                selectedQuestionKey === question.questionKey
                  ? "border-brand-navy bg-brand-surface"
                  : "border-brand-border bg-white"
              }`}
            >
              <div className="mb-2">
                <StatusBadge kind="process">{question.category}</StatusBadge>
              </div>
              <p className="font-semibold">{question.question}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border border-brand-border bg-white p-5">
        {selectedQuestion ? (
          <>
            <StatusBadge kind="process">{selectedQuestion.category}</StatusBadge>
            <h2 className="mt-3 text-xl font-bold leading-snug">{selectedQuestion.question}</h2>
            <p className="mt-2 text-sm text-brand-muted">
              評価観点: {selectedQuestion.evaluationFocus}
            </p>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">回答</span>
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="min-h-[220px] w-full rounded-lg border border-[#c8d2e0] p-4 outline-none focus:ring-4 focus:ring-[rgba(40,75,125,0.18)]"
                placeholder="STARを意識して、状況、行動、結果、次の改善を含めて答えてください。"
              />
            </label>

            {error ? <p className="mt-3 text-sm text-brand-danger">{error}</p> : null}

            <button
              type="button"
              onClick={submitAnswer}
              disabled={isSubmitting || answer.trim().length < 20}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-navy px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              <Send size={16} aria-hidden="true" />
              Evaluate answer
            </button>

            {evaluation ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[240px_1fr]">
                <div className="rounded-lg border border-brand-border p-4">
                  <p className="text-sm font-bold text-brand-muted">Overall</p>
                  <p className="mt-2 font-mono text-4xl font-bold text-brand-navy">
                    {evaluation.scores.overall}
                  </p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Score label="Specificity" value={evaluation.scores.specificity} />
                    <Score label="Role fit" value={evaluation.scores.roleRelevance} />
                    <Score label="Evidence" value={evaluation.scores.evidenceStrength} />
                  </dl>
                </div>
                <div className="space-y-4 rounded-lg border border-brand-border p-4">
                  <div>
                    <p className="font-bold">Weak points</p>
                    <ul className="mt-2 list-inside list-disc text-sm text-brand-muted">
                      {evaluation.improvementPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold">Revised outline</p>
                    <p className="mt-2 text-sm text-brand-muted">
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
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
