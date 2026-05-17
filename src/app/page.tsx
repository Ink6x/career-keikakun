import Link from "next/link";
import { Database, FileUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-surface">
      <section className="flex flex-1 items-center px-page-x py-section-y">
        <div className="mx-auto w-full max-w-page">
          <div className="text-center">
            <h1 className="font-marker text-brand-title text-brand-ink">
              キャリアけいかくん
            </h1>
            <p className="mt-6 text-brand-ink sm:mt-8">
              職務経歴書と求人票から、90日後に転職するまでの行動計画をAIと一緒にたててみよう
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:gap-6 sm:grid-cols-2">
            <Card className="flex flex-col items-start p-6 sm:p-8">
              <Database
                size={28}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-brand-ink"
              />
              <h2 className="heading mt-5 text-card-title font-bold text-brand-ink sm:mt-6">
                サンプルデータで始める
              </h2>
              <p className="mt-3 text-[15px] leading-[1.9] text-brand-muted sm:mt-4">
                架空のプロフィールを使って、キャリアプランニングの機能をすぐに体験できます。
              </p>
              <Link
                href="/analyze?mode=sample"
                className={buttonClassName("secondary", "mt-6 w-full sm:mt-8")}
              >
                お試しスタート
              </Link>
            </Card>

            <Card className="flex flex-col items-start p-6 sm:p-8">
              <FileUp
                size={28}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-brand-primary"
              />
              <h2 className="heading mt-5 text-card-title font-bold text-brand-ink sm:mt-6">
                自分のデータで始める
              </h2>
              <p className="mt-3 text-[15px] leading-[1.9] text-brand-muted sm:mt-4">
                あなたの職務経歴や目標を入力し、本格的なキャリアプランニングを開始します。
              </p>
              <Link
                href="/analyze"
                className={buttonClassName("primary", "mt-6 w-full sm:mt-8")}
              >
                本格スタート
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
