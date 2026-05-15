import { notFound } from "next/navigation";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
        eyebrow="Plan"
        title="12週間の準備計画"
        description={bundle.plan.planSummary}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bundle.plan.weeks.map((week) => (
          <article
            key={week.weekKey}
            className={`rounded-lg border bg-white p-5 ${
              week.weekNumber === bundle.plan.currentWeek
                ? "border-brand-navy"
                : "border-brand-border"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-brand-muted">Week {week.weekNumber}</p>
              <StatusBadge kind={week.status}>{week.status}</StatusBadge>
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug">{week.objective}</h2>
            <div className="mt-4 space-y-3">
              {week.tasks.map((task) => (
                <div key={task.taskKey} className="rounded-lg border border-brand-border p-3">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-2 text-sm text-brand-muted">{task.evidenceToCreate}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-brand-muted">{week.reviewPrompt}</p>
            <Link
              href={`/workspace/${bundle.session.id}/review?week=${week.weekNumber}`}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#c8d2e0] px-4 text-sm font-bold text-brand-navy"
            >
              <ClipboardCheck size={16} aria-hidden="true" />
              Review this week
            </Link>
          </article>
        ))}
      </div>
    </WorkspaceShell>
  );
}
