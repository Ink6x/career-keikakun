import Link from "next/link";
import { AnalyzeForm } from "./AnalyzeForm";

interface AnalyzePageProps {
  searchParams: Promise<{ mode?: string }>;
}

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-brand-surface px-4 py-8 md:px-8">
      <section className="mx-auto max-w-[960px]">
        <Link href="/" className="text-sm font-bold text-brand-navy">
          キャリアけいかくん
        </Link>
        <div className="mt-8 rounded-lg border border-brand-border bg-white p-4">
          <div className="grid gap-2 text-sm font-semibold text-brand-muted md:grid-cols-3">
            <span className="rounded-md bg-brand-navy px-3 py-2 text-white">Content input / check</span>
            <span className="rounded-md bg-brand-surface px-3 py-2">AI analysis</span>
            <span className="rounded-md bg-brand-surface px-3 py-2">Workspace</span>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm font-bold text-brand-navy">Analyze</p>
          <h1 className="mt-2 text-[30px] font-bold leading-tight md:text-[40px]">
            職務経歴と求人票を貼り付けてください
          </h1>
          <p className="mt-4 max-w-2xl text-brand-muted">
            ここでは raw text を通常保存しません。分析には hash、summary、構造化データ、trace-safe な監査情報だけを使います。
          </p>
        </div>

        <AnalyzeForm mode={params.mode ?? null} />
      </section>
    </main>
  );
}
