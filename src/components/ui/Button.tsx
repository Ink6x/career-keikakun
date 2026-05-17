import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";

const baseClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-button px-4 text-sm font-semibold leading-none transition disabled:cursor-not-allowed disabled:opacity-60";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-white hover:brightness-95",
  secondary: "bg-brand-ink text-white hover:opacity-90",
  outline: "border border-brand-border bg-transparent text-brand-ink hover:bg-brand-surface-alt"
};

export function buttonClassName(variant: ButtonVariant = "primary", extra = ""): string {
  return `${baseClass} ${variantClass[variant]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClassName(variant, className)} {...rest}>
      {children}
    </button>
  );
}
