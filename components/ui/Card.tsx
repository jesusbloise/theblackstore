import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type CardVariant = "default" | "outlined" | "soft";
type CardPadding = "none" | "sm" | "md" | "lg";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
};

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
};

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
};

type CardContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-slate-200 bg-white shadow-[var(--incal-shadow-sm)]",

  outlined:
    "border border-slate-200 bg-white",

  soft:
    "border border-brand-100 bg-brand-50",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-1.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={[
        "text-lg font-extrabold tracking-tight text-brand-950",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={[
        "text-sm leading-6 text-slate-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: CardContentProps) {
  return (
    <div
      className={[
        "mt-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={[
        "mt-6 flex items-center gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
