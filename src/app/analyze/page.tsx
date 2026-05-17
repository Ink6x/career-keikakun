import Link from "next/link";
import { AnalyzeForm } from "./AnalyzeForm";

interface AnalyzePageProps {
  searchParams: Promise<{ mode?: string }>;
}

const steps = [
  { key: "input", label: "入力 / 確認" },
  { key: "analysis", label: "AI 分析" },
  { key: "workspace", label: "ワークスペース" }
];

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-brand-surface px-page-x py-section-y">
      <section className="mx-auto w-full max-w-prose">
        <Link href="/" className="font-marker text-base text-brand-muted hover:text-brand-ink">
          ← キャリアけいかくん
        </Link>

        <ol className="mt-8 flex flex-wrap items-center gap-2 text-[12px] font-semibold sm:text-[13px]">
          {steps.map((step, index) => (
            <li key={step.key} className="flex flex-1 items-center gap-2 min-w-[90px]">
              <span
                className={`flex flex-1 items-center justify-center rounded-button px-3 py-2 text-center ${
                  index === 0
                    ? "bg-brand-ink text-white"
                    : "border border-brand-border text-brand-muted"
                }`}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <p className="text-sm font-semibold text-brand-muted">入力 / 確認</p>
          <h1 className="heading mt-2 text-screen-title font-bold text-brand-ink">
            職務経歴と求人票を貼り付けてください
          </h1>
          <p className="mt-4 text-brand-muted">
            raw text は保存しません。分析には hash、要約、構造化データ、trace 用の監査情報のみを使います。
          </p>
        </div>

        <AnalyzeForm mode={params.mode ?? null} />
      </section>
    </main>
  );
}
