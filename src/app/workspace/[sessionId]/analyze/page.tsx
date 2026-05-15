import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getSessionForVisitor } from "@/server/session-store";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WorkspaceAnalyzePage({ params }: PageProps) {
  const { sessionId } = await params;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  const { analyze } = bundle;
  const breakdown = analyze.matchAnalysis.scoringBreakdown;

  return (
    <WorkspaceShell activeTab="analyze" session={bundle.session}>
      <SectionHeader
        eyebrow="Analyze"
        title="スコアと証拠ギャップ"
        description="求人要件ごとに、どの経験が使えて、どの証拠が不足しているかを分解します。"
      />

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-brand-border bg-white p-5">
          <p className="text-sm font-bold text-brand-muted">Match Score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-mono text-[56px] font-bold leading-none text-brand-navy">
              {analyze.matchAnalysis.matchScore}
            </span>
            <span className="pb-2 text-lg font-bold text-brand-muted">/100</span>
          </div>
          <p className="mt-4 text-lg font-bold">{analyze.matchAnalysis.verdictLabel}</p>
          <p className="mt-2 text-sm text-brand-muted">
            {analyze.matchAnalysis.explanationSnapshot}
          </p>

          <dl className="mt-6 grid gap-3 text-sm">
            <ScoreLine label="Required coverage" value={breakdown.requiredCoverageScore} max={45} />
            <ScoreLine label="Preferred coverage" value={breakdown.preferredCoverageScore} max={15} />
            <ScoreLine label="Evidence strength" value={breakdown.evidenceStrengthScore} max={25} />
            <ScoreLine label="Skill proximity" value={breakdown.adjacentSkillSupportScore} max={10} />
          </dl>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {(["strength", "priority_gap", "evidence_needed"] as const).map((group) => (
            <div key={group} className="rounded-lg border border-brand-border bg-white p-5">
              <h3 className="text-sm font-bold text-brand-muted">
                {group === "strength"
                  ? "Strengths"
                  : group === "priority_gap"
                    ? "Priority Gaps"
                    : "Evidence Needed"}
              </h3>
              <div className="mt-4 space-y-4">
                {analyze.keyFindings
                  .filter((finding) => finding.group === group)
                  .map((finding) => (
                    <div key={finding.title}>
                      <p className="font-bold">{finding.title}</p>
                      <p className="mt-1 text-sm text-brand-muted">{finding.detail}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-brand-border bg-white p-5">
        <SectionHeader title="Requirement Coverage" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-separate border-spacing-0 text-left text-sm">
            <thead className="text-xs font-bold uppercase text-brand-muted">
              <tr>
                <th className="border-b border-brand-border py-2 pr-3">Requirement</th>
                <th className="border-b border-brand-border py-2 pr-3">Type</th>
                <th className="border-b border-brand-border py-2 pr-3">Status</th>
                <th className="border-b border-brand-border py-2 pr-3">Weight</th>
                <th className="border-b border-brand-border py-2 pr-3">Evidence</th>
                <th className="border-b border-brand-border py-2">Gap note</th>
              </tr>
            </thead>
            <tbody>
              {analyze.requirementCoverage.map((coverage) => (
                <tr key={coverage.requirementKey}>
                  <td className="border-b border-brand-border py-3 pr-3 font-semibold">
                    {coverage.requirement}
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3">
                    <StatusBadge kind={coverage.type}>{coverage.type}</StatusBadge>
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3">
                    <StatusBadge kind={coverage.status}>{coverage.status}</StatusBadge>
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3">
                    {coverage.weight.toFixed(1)}
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3 text-brand-muted">
                    {coverage.evidenceFromProfile.join(" / ") || "なし"}
                  </td>
                  <td className="border-b border-brand-border py-3 text-brand-muted">
                    {coverage.gapNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-brand-border bg-white p-5">
          <SectionHeader title="Skill Map" />
          <div className="grid gap-3">
            {analyze.skillMatches.map((skill) => (
              <div
                key={skill.skillMatchKey}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border p-3"
              >
                <div>
                  <p className="font-semibold">{skill.canonicalSkill ?? "Pending skill"}</p>
                  <p className="text-sm text-brand-muted">{skill.basis}</p>
                </div>
                <StatusBadge kind={skill.relationship}>{skill.relationship}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-brand-border bg-white p-5">
          <SectionHeader title="Evidence Gaps" />
          <div className="space-y-3">
            {analyze.evidenceGaps.map((gap) => (
              <article key={gap.gapKey} className="rounded-lg border border-brand-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold">{gap.title}</h3>
                  <StatusBadge kind="process">{gap.expectedImpact} impact</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">{gap.whyItMatters}</p>
                <p className="mt-3 text-sm font-semibold text-brand-navy">
                  作る証拠: {gap.evidenceToCreate}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-brand-border bg-white p-5">
        <p className="text-sm font-bold text-brand-muted">Next Action</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-3xl font-semibold">{analyze.nextAction}</p>
          <Link
            href={`/workspace/${bundle.session.id}/plan`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-navy px-4 text-sm font-bold text-white"
          >
            Open Plan
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </WorkspaceShell>
  );
}

function ScoreLine({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3">
        <dt className="font-semibold">{label}</dt>
        <dd className="font-mono text-brand-muted">
          {value}/{max}
        </dd>
      </div>
      <div className="h-2 rounded-full bg-brand-surface">
        <div
          className="h-2 rounded-full bg-brand-navy"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}
