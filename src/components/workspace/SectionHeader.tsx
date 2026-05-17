interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold tracking-normal text-brand-muted">{eyebrow}</p>
      ) : null}
      <h2 className="heading text-screen-title font-bold text-brand-ink">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-prose text-brand-muted">{description}</p>
      ) : null}
    </div>
  );
}
