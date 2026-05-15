import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSessionForVisitor } from "@/server/session-store";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function TracePage({ params }: PageProps) {
  const { sessionId } = await params;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  return (
    <WorkspaceShell activeTab="trace" session={bundle.session}>
      <SectionHeader
        eyebrow="Process Trace"
        title="AI pipeline の制御証跡"
        description="provider mode、schema validation、scoring breakdown、audit event を raw text なしで表示します。"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-brand-border bg-white p-5">
          <p className="mb-4 text-sm font-bold text-brand-muted">Pipeline steps</p>
          <div className="space-y-3">
            {bundle.trace.pipelineSteps.map((step) => (
              <article
                key={step.stepName}
                className="rounded-lg border border-brand-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-mono text-sm font-bold">{step.stepName}</h2>
                  <div className="flex gap-2">
                    <StatusBadge kind="process">{step.status}</StatusBadge>
                    <StatusBadge kind={step.providerMode}>{step.providerMode}</StatusBadge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{step.summary}</p>
                <p className="mt-2 break-all font-mono text-xs text-brand-muted">
                  hashes: {step.inputHashRefs.map((hash) => hash.slice(0, 12)).join(" / ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-brand-border bg-white p-5">
            <p className="text-sm font-bold text-brand-muted">Scoring breakdown</p>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Required" value={bundle.trace.scoringBreakdown.requiredCoverageScore} />
              <Row label="Preferred" value={bundle.trace.scoringBreakdown.preferredCoverageScore} />
              <Row label="Evidence" value={bundle.trace.scoringBreakdown.evidenceStrengthScore} />
              <Row label="Adjacent" value={bundle.trace.scoringBreakdown.adjacentSkillSupportScore} />
              <Row label="Plan" value={bundle.trace.scoringBreakdown.planReadinessScore} />
            </dl>
            <p className="mt-4 text-xs text-brand-muted">
              scoreVersion: {bundle.trace.scoringBreakdown.scoreVersion}
            </p>
          </section>

          <section className="rounded-lg border border-brand-border bg-white p-5">
            <p className="text-sm font-bold text-brand-muted">Embedding use</p>
            <p className="mt-2 font-semibold">{bundle.trace.embeddingMode}</p>
            <p className="mt-1 text-sm text-brand-muted">
              similarity use: {bundle.trace.similarityUse}
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              direct score contribution: {bundle.trace.directScoreContribution}
            </p>
          </section>

          <section className="rounded-lg border border-brand-border bg-white p-5">
            <p className="text-sm font-bold text-brand-muted">Audit events</p>
            <div className="mt-3 space-y-3">
              {bundle.trace.auditEvents.map((event) => (
                <div key={event.eventKey} className="rounded-lg border border-brand-border p-3">
                  <p className="font-mono text-sm font-bold">{event.eventType}</p>
                  <p className="text-xs text-brand-muted">{event.createdAt}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </WorkspaceShell>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="font-mono font-semibold">{value}</dd>
    </div>
  );
}
