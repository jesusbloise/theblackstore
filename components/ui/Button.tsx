import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-950 text-white hover:bg-brand-900 active:bg-brand-800 disabled:bg-brand-300 disabled:text-white",

  secondary:
    "bg-accent-400 text-brand-950 hover:bg-accent-500 active:bg-accent-600 disabled:bg-accent-100 disabled:text-brand-400",

  outline:
    "border border-brand-300 bg-white text-brand-950 hover:border-brand-500 hover:bg-brand-50 active:bg-brand-100 disabled:border-brand-100 disabled:text-[#777777]",

  ghost:
    "bg-transparent text-brand-950 hover:bg-brand-50 active:bg-brand-100 disabled:text-[#777777]",

  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-[4px] px-4 text-sm",
  md: "min-h-11 rounded-[4px] px-5 text-sm",
  lg: "min-h-13 rounded-[4px] px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}

      <span className="inline-flex items-center justify-center gap-2">{isLoading ? "Cargando..." : children}</span>
    </button>
  );
}