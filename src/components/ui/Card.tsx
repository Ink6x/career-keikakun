import type { HTMLAttributes, ReactNode } from "react";

export type CardSurface = "base" | "alt";
export type CardElevation = "flat" | "lift";

const surfaceClass: Record<CardSurface, string> = {
  base: "bg-brand-surface",
  alt: "bg-brand-surface-alt"
};

const elevationClass: Record<CardElevation, string> = {
  flat: "",
  lift: "shadow-elevation-1"
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  surface?: CardSurface;
  elevation?: CardElevation;
  children: ReactNode;
}

export function Card({
  surface = "base",
  elevation = "flat",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded-card border border-brand-border ${surfaceClass[surface]} ${elevationClass[elevation]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
}
