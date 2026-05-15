import Link from "next/link";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-surface px-4 py-8 md:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[960px] flex-col justify-center">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-bold text-brand-navy">キャリアけいかくん</p>
          <h1 className="text-[30px] font-bold leading-tight md:text-[40px]">
            職務経歴と求人票から、90日で作るべき証拠を整理する
          </h1>
          <p className="mt-5 max-w-2xl text-base text-brand-muted">
            経験、求人要件、スキル差分、証拠不足をまとめて分析し、週ごとの準備計画と面接練習につなげます。
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/analyze?mode=sample"
            className="group rounded-lg border border-brand-border bg-white p-5 transition hover:shadow-clickable"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-navy text-white">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold">サンプルデータで試す</h2>
            <p className="mt-2 text-sm text-brand-muted">
              BtoB SaaS CS から Product Operations を目指すデモケースを読み込みます。
            </p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white">
              Start with sample
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>

          <Link
            href="/analyze"
            className="group rounded-lg border border-brand-border bg-white p-5 transition hover:shadow-clickable"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-surface text-brand-navy">
              <FileText size={22} aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold">自分の内容を分析する</h2>
            <p className="mt-2 text-sm text-brand-muted">
              職務経歴と求人票を貼り付けて、mock fallback の分析フローを実行します。
            </p>
            <span className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#c8d2e0] px-4 text-sm font-semibold text-brand-navy">
              Analyze my content
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
