import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import type { AnalysisSessionSummary } from "@/lib/keikakun/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

type WorkspaceTab = "analyze" | "plan" | "review" | "interview" | "evidence" | "trace";

interface WorkspaceShellProps {
  activeTab: WorkspaceTab;
  session: AnalysisSessionSummary;
  children: React.ReactNode;
}

const tabs: Array<{ key: WorkspaceTab; label: string; href: string }> = [
  { key: "analyze", label: "Analyze", href: "analyze" },
  { key: "plan", label: "Plan", href: "plan" },
  { key: "review", label: "Review", href: "review" },
  { key: "interview", label: "Interview Studio", href: "interview" },
  { key: "evidence", label: "Evidence Builder", href: "evidence" },
  { key: "trace", label: "Process Trace", href: "trace" }
];

export function WorkspaceShell({ activeTab, session, children }: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-brand-surface">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col gap-0 lg:flex-row">
        <aside className="border-b border-brand-border bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4 border-b border-brand-border p-4 lg:block lg:p-6">
            <div>
              <Link href="/" className="text-lg font-bold text-brand-navy">
                キャリアけいかくん
              </Link>
              <p className="mt-1 hidden text-sm text-brand-muted lg:block">
                証拠づくりに向けたキャリア準備
              </p>
            </div>
            <Link
              href="/analyze"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#c8d2e0] px-3 text-sm font-semibold text-brand-navy"
            >
              <RefreshCcw size={16} aria-hidden="true" />
              New
            </Link>
          </div>

          <div className="space-y-3 border-b border-brand-border p-4 lg:p-6">
            <p className="text-xs font-semibold uppercase text-brand-muted">Target role</p>
            <h1 className="text-xl font-bold leading-snug">{session.displayTargetRoleTitle}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
              <StatusBadge kind={session.providerMode}>
                {session.providerMode === "fallback"
                  ? "Fallback"
                  : session.providerMode === "real"
                    ? "Real"
                    : "Mock"}
              </StatusBadge>
              <span>{new Date(session.completedAt).toLocaleString("ja-JP")}</span>
            </div>
          </div>

          <nav
            aria-label="Workspace navigation"
            className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible lg:p-4"
          >
            {tabs.map((tab) => {
              const href = `/workspace/${session.id}/${tab.href}`;
              const isActive = activeTab === tab.key;

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={`flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-semibold lg:w-full ${
                    isActive
                      ? "bg-brand-navy text-white"
                      : "text-brand-muted hover:bg-brand-surface hover:text-brand-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 p-4 lg:p-8">{children}</section>
      </div>
    </main>
  );
}
