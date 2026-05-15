import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getSessionForVisitor } from "@/server/session-store";
import { InterviewStudioClient } from "./InterviewStudioClient";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { sessionId } = await params;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  return (
    <WorkspaceShell activeTab="interview" session={bundle.session}>
      <SectionHeader
        eyebrow="Interview Studio"
        title="職種別の面接練習"
        description="初期6問は、求人要件、証拠ギャップ、計画の優先度に基づいて固定カテゴリで生成されています。"
      />
      <InterviewStudioClient sessionId={bundle.session.id} questions={bundle.interview.questions} />
    </WorkspaceShell>
  );
}
