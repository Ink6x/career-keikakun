import { notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonClassName } from "@/components/ui/Button";
import { getSessionForVisitor } from "@/server/session-store";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function PlanPage({ params }: PageProps) {
  const { sessionId } = await params;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  return (
    <WorkspaceShell activeTab="plan" session={bundle.session}>
      <SectionHeader
        eyebrow="プラン"
        title="12週間の準備計画"
        description={bundle.plan.planSummary}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {bundle.plan.weeks.map((week) => {
          const isCurrent = week.weekNumber === bundle.plan.currentWeek;
          return (
            <article
              key={week.weekKey}
              className={`rounded-card border bg-brand-surface p-5 sm:p-6 ${
                isCurrent ? "border-brand-ink shadow-elevation-1" : "border-brand-border"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand-muted">Week {week.weekNumber}</p>
                <StatusBadge kind={week.status}>{week.status}</StatusBadge>
              </div>
              <h2 className="heading mt-3 text-card-title font-bold text-brand-ink">
                {week.objective}
              </h2>
              <div className="mt-5 space-y-3">
                {week.tasks.map((task) => (
                  <div
                    key={task.taskKey}
                    className="rounded-card border border-brand-border bg-brand-surface-alt p-4"
                  >
                    <p className="font-semibold text-brand-ink">{task.title}</p>
                    <p className="mt-2 text-sm leading-[1.8] text-brand-muted">
                      {task.evidenceToCreate}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-[1.8] text-brand-muted">{week.reviewPrompt}</p>
              <Link
                href={`/workspace/${bundle.session.id}/review?week=${week.weekNumber}`}
                className={buttonClassName("outline", "mt-5 w-full")}
              >
                <ClipboardCheck size={16} aria-hidden="true" />
                この週をレビュー
              </Link>
            </article>
          );
        })}
      </div>
    </WorkspaceShell>
  );
}
