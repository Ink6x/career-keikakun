"use client";

import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EvidenceArtifact, EvidenceMaterialStatus } from "@/lib/keikakun/types";

interface EvidenceBoardClientProps {
  sessionId: string;
  initialMaterials: EvidenceArtifact[];
}

const statuses: EvidenceMaterialStatus[] = ["not_started", "in_progress", "ready", "archived"];

const statusLabel: Record<EvidenceMaterialStatus, string> = {
  not_started: "未着手",
  in_progress: "進行中",
  ready: "完了",
  archived: "アーカイブ"
};

export function EvidenceBoardClient({ sessionId, initialMaterials }: EvidenceBoardClientProps) {
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

  const chipClass = (active: boolean) =>
    `min-h-10 rounded-full px-3 text-sm font-semibold transition ${
      active
        ? "bg-brand-ink text-white"
        : "border border-brand-border bg-brand-surface text-brand-muted hover:text-brand-ink"
    }`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-card border border-brand-border bg-brand-surface p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedStatus("all")}
            className={chipClass(selectedStatus === "all")}
          >
            すべて
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={chipClass(selectedStatus === status)}
            >
              {statusLabel[status]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredMaterials.map((material) => (
            <button
              key={material.artifactKey}
              type="button"
              onClick={() => setSelectedKey(material.artifactKey)}
              className={`w-full rounded-card border p-4 text-left transition ${
                selectedKey === material.artifactKey
                  ? "border-brand-ink bg-brand-surface-alt"
                  : "border-brand-border bg-brand-surface hover:bg-brand-surface-alt"
              }`}
            >
              <div className="mb-2">
                <StatusBadge kind={material.status}>{statusLabel[material.status]}</StatusBadge>
              </div>
              <p className="font-semibold leading-[1.5] text-brand-ink">{material.title}</p>
              <p className="mt-1 text-sm text-brand-muted">Week {material.targetWeek ?? "-"}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-card border border-brand-border bg-brand-surface p-5 sm:p-6">
        {selectedMaterial ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-muted">証拠素材</p>
                <h2 className="heading mt-2 text-card-title font-bold text-brand-ink">
                  {selectedMaterial.title}
                </h2>
              </div>
              <StatusBadge kind={selectedMaterial.status}>
                {statusLabel[selectedMaterial.status]}
              </StatusBadge>
            </div>

            <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
              <Detail label="証拠タイプ" value={selectedMaterial.proofType} />
              <Detail label="出典" value={selectedMaterial.source} />
              <Detail label="なぜ重要か" value={selectedMaterial.whyItMatters} />
              <Detail label="作る証拠" value={selectedMaterial.evidenceToCreate} />
              <Detail label="次のアクション" value={selectedMaterial.nextAction} />
              <Detail label="対象週" value={String(selectedMaterial.targetWeek ?? "-")} />
            </dl>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-semibold text-brand-ink">メモ</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-[100px] w-full rounded-card border border-brand-border bg-white p-3 text-[15px] leading-[1.8] outline-none focus:ring-4 focus:ring-brand-primary-soft sm:min-h-[120px]"
                placeholder="今の進捗や、次に追加する証拠を書いてください。"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(status)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-button border border-brand-border bg-transparent px-4 text-sm font-semibold leading-none text-brand-ink transition hover:bg-brand-surface-alt"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {statusLabel[status]} にする
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
    <div className="rounded-card border border-brand-border p-4">
      <dt className="text-xs font-semibold text-brand-muted">{label}</dt>
      <dd className="mt-2 font-semibold leading-[1.7] text-brand-ink">{value}</dd>
    </div>
  );
}
