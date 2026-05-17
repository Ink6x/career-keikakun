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
        eyebrow="プロセス確認"
        title="AI パイプラインの制御証跡"
        description="provider mode・schema validation・scoring breakdown・audit event を raw text なしで表示します。"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <p className="mb-4 text-sm font-semibold text-brand-muted">パイプラインステップ</p>
          <div className="space-y-3">
            {bundle.trace.pipelineSteps.map((step) => (
              <article
                key={step.stepName}
                className="rounded-card border border-brand-border bg-brand-surface-alt p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-mono text-sm font-bold text-brand-ink">{step.stepName}</h2>
                  <div className="flex gap-2">
                    <StatusBadge kind="process">{step.status}</StatusBadge>
                    <StatusBadge kind={step.providerMode}>{step.providerMode}</StatusBadge>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-[1.8] text-brand-muted">{step.summary}</p>
                <p className="mt-2 break-all font-mono text-xs text-brand-muted">
                  hashes: {step.inputHashRefs.map((hash) => hash.slice(0, 12)).join(" / ")}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
            <p className="text-sm font-semibold text-brand-muted">スコア内訳</p>
            <dl className="mt-3 space-y-2 text-sm leading-[1.8]">
              <Row label="必須" value={bundle.trace.scoringBreakdown.requiredCoverageScore} />
              <Row label="歓迎" value={bundle.trace.scoringBreakdown.preferredCoverageScore} />
              <Row label="証拠" value={bundle.trace.scoringBreakdown.evidenceStrengthScore} />
              <Row label="近接" value={bundle.trace.scoringBreakdown.adjacentSkillSupportScore} />
              <Row label="計画" value={bundle.trace.scoringBreakdown.planReadinessScore} />
            </dl>
            <p className="mt-4 text-xs text-brand-muted">
              scoreVersion: {bundle.trace.scoringBreakdown.scoreVersion}
            </p>
          </section>

          <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
            <p className="text-sm font-semibold text-brand-muted">Embedding 使用状況</p>
            <p className="mt-2 font-semibold text-brand-ink">{bundle.trace.embeddingMode}</p>
            <p className="mt-1 text-sm leading-[1.8] text-brand-muted">
              similarity use: {bundle.trace.similarityUse}
            </p>
            <p className="mt-1 text-sm leading-[1.8] text-brand-muted">
              direct score contribution: {bundle.trace.directScoreContribution}
            </p>
          </section>

          <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
            <p className="text-sm font-semibold text-brand-muted">監査イベント</p>
            <div className="mt-3 space-y-3">
              {bundle.trace.auditEvents.map((event) => (
                <div
                  key={event.eventKey}
                  className="rounded-card border border-brand-border bg-brand-surface-alt p-3"
                >
                  <p className="font-mono text-sm font-bold text-brand-ink">{event.eventType}</p>
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
      <dt className="text-brand-ink">{label}</dt>
      <dd className="font-mono font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}
