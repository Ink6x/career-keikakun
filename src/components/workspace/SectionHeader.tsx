interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <p className="mb-1 text-xs font-bold uppercase tracking-normal text-brand-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold leading-tight md:text-[28px]">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm text-brand-muted">{description}</p> : null}
    </div>
  );
}
