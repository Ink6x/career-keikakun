"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EvidenceArtifact, EvidenceMaterialStatus } from "@/lib/keikakun/types";

interface EvidenceBoardClientProps {
  sessionId: string;
  initialMaterials: EvidenceArtifact[];
}

const statuses: EvidenceMaterialStatus[] = [
  "not_started",
  "in_progress",
  "ready",
  "archived"
];

export function EvidenceBoardClient({
  sessionId,
  initialMaterials
}: EvidenceBoardClientProps) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [selectedStatus, setSelectedStatus] = useState<EvidenceMaterialStatus | "all">("all");
  const [selectedKey, setSelectedKey] = useState(initialMaterials[0]?.artifactKey ?? "");
  const [note, setNote] = useState("");

  const filteredMaterials = useMemo(
    () =>
      selectedStatus === "all"
        ? materials
        : materials.filter((material) => material.status === selectedStatus),
    [materials, selectedStatus]
  );
  const selectedMaterial =
    materials.find((material) => material.artifactKey === selectedKey) ?? filteredMaterials[0];

  async function updateStatus(status: EvidenceMaterialStatus) {
    if (!selectedMaterial) {
      return;
    }

    const response = await fetch(
      `/api/analysis-sessions/${sessionId}/evidence-materials/${selectedMaterial.artifactKey}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          note,
          nextAction: selectedMaterial.nextAction
        })
      }
    );
    const payload = await response.json();

    if (response.ok) {
      setMaterials((current) =>
        current.map((material) =>
          material.artifactKey === selectedMaterial.artifactKey ? payload.data.material : material
        )
      );
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-brand-border bg-white p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
              selectedStatus === "all" ? "bg-brand-navy text-white" : "bg-brand-surface text-brand-muted"
            }`}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`min-h-10 rounded-full px-3 text-sm font-semibold ${
                selectedStatus === status
                  ? "bg-brand-navy text-white"
                  : "bg-brand-surface text-brand-muted"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredMaterials.map((material) => (
            <button
              key={material.artifactKey}
              type="button"
              onClick={() => setSelectedKey(material.artifactKey)}
              className={`w-full rounded-lg border p-3 text-left ${
                selectedKey === material.artifactKey
                  ? "border-brand-navy bg-brand-surface"
                  : "border-brand-border"
              }`}
            >
              <div className="mb-2">
                <StatusBadge kind={material.status}>{material.status}</StatusBadge>
              </div>
              <p className="font-semibold">{material.title}</p>
              <p className="mt-1 text-sm text-brand-muted">Week {material.targetWeek ?? "-"}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border border-brand-border bg-white p-5">
        {selectedMaterial ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-brand-muted">Evidence material</p>
                <h2 className="mt-2 text-2xl font-bold">{selectedMaterial.title}</h2>
              </div>
              <StatusBadge kind={selectedMaterial.status}>{selectedMaterial.status}</StatusBadge>
            </div>

            <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
              <Detail label="Proof type" value={selectedMaterial.proofType} />
              <Detail label="Source" value={selectedMaterial.source} />
              <Detail label="Why it matters" value={selectedMaterial.whyItMatters} />
              <Detail label="Evidence to create" value={selectedMaterial.evidenceToCreate} />
              <Detail label="Next action" value={selectedMaterial.nextAction} />
              <Detail label="Target week" value={String(selectedMaterial.targetWeek ?? "-")} />
            </dl>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold">Note</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-[#c8d2e0] p-3 outline-none focus:ring-4 focus:ring-[rgba(40,75,125,0.18)]"
                placeholder="今の進捗や、次に追加する証拠を書いてください。"
              />
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(status)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#c8d2e0] px-4 text-sm font-bold text-brand-navy"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {status}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-border p-3">
      <dt className="text-xs font-bold uppercase text-brand-muted">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
