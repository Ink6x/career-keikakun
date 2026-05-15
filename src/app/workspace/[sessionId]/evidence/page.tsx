import { notFound } from "next/navigation";
import { SectionHeader } from "@/components/workspace/SectionHeader";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { getSessionForVisitor } from "@/server/session-store";
import { EvidenceBoardClient } from "./EvidenceBoardClient";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function EvidencePage({ params }: PageProps) {
  const { sessionId } = await params;
  const bundle = getSessionForVisitor(sessionId);

  if (!bundle) {
    notFound();
  }

  return (
    <WorkspaceShell activeTab="evidence" session={bundle.session}>
      <SectionHeader
        eyebrow="Evidence Builder"
        title="証拠素材ボード"
        description="分析、計画、レビュー、面接練習から作るべき証拠素材を管理します。文章生成ではなく、素材の状態管理に限定します。"
      />
      <EvidenceBoardClient
        sessionId={bundle.session.id}
        initialMaterials={bundle.evidence.materials}
      />
    </WorkspaceShell>
  );
}
