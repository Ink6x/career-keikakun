import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import type { AnalysisSessionSummary } from "@/lib/keikakun/types";
import { buttonClassName } from "@/components/ui/Button";

type WorkspaceTab = "analyze" | "plan" | "review" | "interview" | "evidence" | "trace";

interface WorkspaceShellProps {
  activeTab: WorkspaceTab;
  session: AnalysisSessionSummary;
  children: React.ReactNode;
}

const tabs: Array<{ key: WorkspaceTab; label: string; href: string }> = [
  { key: "analyze", label: "分析", href: "analyze" },
  { key: "plan", label: "プラン", href: "plan" },
  { key: "review", label: "週次レビュー", href: "review" },
  { key: "interview", label: "面接スタジオ", href: "interview" },
  { key: "evidence", label: "証拠ボード", href: "evidence" },
  { key: "trace", label: "プロセス確認", href: "trace" }
];

export function WorkspaceShell({ activeTab, session, children }: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-brand-surface">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-brand-border bg-brand-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r 2xl:w-72">
          <div className="flex items-center justify-between gap-4 border-b border-brand-border p-5 lg:block lg:p-6">
            <Link
              href="/"
              className="font-marker whitespace-nowrap text-xl text-brand-ink lg:block lg:w-full lg:text-center lg:text-[24px] 2xl:text-[28px]"
            >
              キャリアけいかくん
            </Link>
            <Link
              href="/analyze"
              className={buttonClassName("outline", "px-3 lg:mt-8 lg:w-full")}
            >
              <RefreshCcw size={16} aria-hidden="true" />
              新規分析
            </Link>
          </div>

          <nav
            aria-label="ワークスペースナビ"
            className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible lg:p-4"
          >
            {tabs.map((tab) => {
              const href = `/workspace/${session.id}/${tab.href}`;
              const isActive = activeTab === tab.key;

              return (
                <Link
                  key={tab.key}
                  href={href}
                  className={`flex min-h-11 shrink-0 items-center rounded-button px-3 text-sm font-semibold transition lg:w-full ${
                    isActive
                      ? "bg-brand-ink text-white"
                      : "text-brand-muted hover:bg-brand-surface-alt hover:text-brand-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 px-page-x py-6 sm:py-8 lg:py-10">{children}</section>
      </div>
    </main>
  );
}
