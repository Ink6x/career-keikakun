import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WorkspaceIndexPage({ params }: PageProps) {
  const { sessionId } = await params;
  redirect(`/workspace/${sessionId}/analyze`);
}
