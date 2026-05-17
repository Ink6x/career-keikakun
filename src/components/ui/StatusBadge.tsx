import type {
  CoverageStatus,
  EvidenceMaterialStatus,
  PlanWeekStatus,
  ProviderMode,
  SkillRelationship
} from "@/lib/keikakun/types";

type BadgeKind =
  | CoverageStatus
  | SkillRelationship
  | EvidenceMaterialStatus
  | PlanWeekStatus
  | ProviderMode
  | "process"
  | "required"
  | "preferred";

interface StatusBadgeProps {
  kind: BadgeKind;
  children: React.ReactNode;
}

const styles: Record<BadgeKind, string> = {
  matched: "bg-brand-success-soft text-brand-success",
  partial: "bg-brand-warning-soft text-brand-warning",
  missing: "bg-brand-danger-soft text-brand-danger",
  adjacent: "bg-brand-warning-soft text-brand-warning",
  pending: "bg-brand-surface-alt text-brand-muted",
  not_started: "bg-brand-surface-alt text-brand-muted",
  in_progress: "bg-brand-warning-soft text-brand-warning",
  ready: "bg-brand-success-soft text-brand-success",
  archived: "bg-brand-surface-alt text-brand-muted",
  completed: "bg-brand-success-soft text-brand-success",
  skipped: "bg-brand-surface-alt text-brand-muted",
  real: "bg-brand-success-soft text-brand-success",
  fallback: "bg-brand-warning-soft text-brand-warning",
  mock: "border border-brand-border bg-transparent text-brand-ink",
  process: "border border-brand-border bg-transparent text-brand-ink",
  required: "bg-brand-danger-soft text-brand-danger",
  preferred: "bg-brand-surface-alt text-brand-muted"
};

export function StatusBadge({ kind, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[11px] font-semibold sm:min-h-7 sm:text-xs ${styles[kind]}`}
    >
      {children}
    </span>
  );
}
