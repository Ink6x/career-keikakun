import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getSessionForVisitor } from "@/server/session-store";
import { ReviewClient } from "./ReviewClient";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ week?: string }>;
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const query = await searchParams;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  const weekNumber = Number(query.week ?? bundle.review.currentWeek);

  return (
    <WorkspaceShell activeTab="review" session={bundle.session}>
      <SectionHeader
        eyebrow="週次レビュー"
        title="今週の振り返り"
        description="チャット風の入力を、計画更新に使える構造化レビューへ変換します。"
      />
      <ReviewClient
        sessionId={bundle.session.id}
        weekNumber={Number.isInteger(weekNumber) ? Math.min(12, Math.max(1, weekNumber)) : 1}
        openTasks={bundle.review.openTasks}
      />
    </WorkspaceShell>
  );
}
