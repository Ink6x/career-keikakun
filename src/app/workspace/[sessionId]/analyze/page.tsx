import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buttonClassName } from "@/components/ui/Button";
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
        eyebrow="分析"
        title="スコアと証拠ギャップ"
        description="求人要件ごとに、どの経験が使えて、どの証拠が不足しているかを分解します。"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <p className="text-sm font-semibold text-brand-muted">マッチスコア</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-mono text-score font-bold text-brand-ink">
              {analyze.matchAnalysis.matchScore}
            </span>
            <span className="pb-2 text-base font-bold text-brand-muted sm:text-lg">/100</span>
          </div>
          <p className="mt-4 text-base font-bold leading-[1.5] text-brand-ink sm:text-lg">
            {analyze.matchAnalysis.verdictLabel}
          </p>
          <p className="mt-3 text-sm leading-[1.8] text-brand-muted">
            {analyze.matchAnalysis.explanationSnapshot}
          </p>

          <dl className="mt-6 grid gap-4 text-sm">
            <ScoreLine label="必須要件のカバレッジ" value={breakdown.requiredCoverageScore} max={45} />
            <ScoreLine label="歓迎要件のカバレッジ" value={breakdown.preferredCoverageScore} max={15} />
            <ScoreLine label="証拠の強さ" value={breakdown.evidenceStrengthScore} max={25} />
            <ScoreLine label="スキル近接度" value={breakdown.adjacentSkillSupportScore} max={10} />
          </dl>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["strength", "priority_gap", "evidence_needed"] as const).map((group) => (
            <div
              key={group}
              className="rounded-card border border-brand-border bg-brand-surface p-5"
            >
              <h3 className="text-sm font-semibold text-brand-muted">
                {group === "strength"
                  ? "強み"
                  : group === "priority_gap"
                    ? "優先ギャップ"
                    : "必要な証拠"}
              </h3>
              <div className="mt-4 space-y-4">
                {analyze.keyFindings
                  .filter((finding) => finding.group === group)
                  .map((finding) => (
                    <div key={finding.title}>
                      <p className="font-bold text-brand-ink">{finding.title}</p>
                      <p className="mt-1 text-sm leading-[1.8] text-brand-muted">{finding.detail}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="mt-8 rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
        <SectionHeader title="要件カバレッジ" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-[13px] sm:min-w-[840px] sm:text-sm">
            <thead className="text-xs font-semibold text-brand-muted">
              <tr>
                <th className="border-b border-brand-border py-3 pr-3">要件</th>
                <th className="border-b border-brand-border py-3 pr-3">種別</th>
                <th className="border-b border-brand-border py-3 pr-3">状態</th>
                <th className="border-b border-brand-border py-3 pr-3">重み</th>
                <th className="border-b border-brand-border py-3 pr-3">証拠</th>
                <th className="border-b border-brand-border py-3">ギャップ</th>
              </tr>
            </thead>
            <tbody>
              {analyze.requirementCoverage.map((coverage) => (
                <tr key={coverage.requirementKey}>
                  <td className="border-b border-brand-border py-3 pr-3 font-semibold text-brand-ink">
                    {coverage.requirement}
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3">
                    <StatusBadge kind={coverage.type}>{coverage.type}</StatusBadge>
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3">
                    <StatusBadge kind={coverage.status}>{coverage.status}</StatusBadge>
                  </td>
                  <td className="border-b border-brand-border py-3 pr-3 text-brand-ink">
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <SectionHeader title="スキルマップ" />
          <div className="grid gap-3">
            {analyze.skillMatches.map((skill) => (
              <div
                key={skill.skillMatchKey}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-ink">
                    {skill.canonicalSkill ?? "Pending skill"}
                  </p>
                  <p className="text-sm leading-[1.8] text-brand-muted">{skill.basis}</p>
                </div>
                <StatusBadge kind={skill.relationship}>{skill.relationship}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
          <SectionHeader title="証拠ギャップ" />
          <div className="space-y-3">
            {analyze.evidenceGaps.map((gap) => (
              <article key={gap.gapKey} className="rounded-card border border-brand-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-bold text-brand-ink">{gap.title}</h3>
                  <StatusBadge kind="process">影響度: {gap.expectedImpact}</StatusBadge>
                </div>
                <p className="mt-2 text-sm leading-[1.8] text-brand-muted">{gap.whyItMatters}</p>
                <p className="mt-3 text-sm font-semibold text-brand-ink">
                  作る証拠: {gap.evidenceToCreate}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
        <p className="text-sm font-semibold text-brand-muted">次のアクション</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-prose font-semibold leading-[1.8] text-brand-ink">
            {analyze.nextAction}
          </p>
          <Link
            href={`/workspace/${bundle.session.id}/plan`}
            className={buttonClassName("primary", "w-full md:w-auto")}
          >
            プランを開く
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
        <dt className="font-semibold text-brand-ink">{label}</dt>
        <dd className="font-mono text-brand-muted">
          {value}/{max}
        </dd>
      </div>
      <div className="h-2 rounded-full bg-brand-surface-alt">
        <div
          className="h-2 rounded-full bg-brand-primary"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}
