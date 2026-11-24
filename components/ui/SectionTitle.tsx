import type { HTMLAttributes, ReactNode } from "react";

type SectionTitleAlign = "left" | "center";
type SectionTitleSize = "sm" | "md" | "lg";

type SectionTitleProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: SectionTitleAlign;
  size?: SectionTitleSize;
  action?: ReactNode;
};

const alignClasses: Record<SectionTitleAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
};

const titleSizeClasses: Record<SectionTitleSize, string> = {
  sm: "text-2xl sm:text-3xl",
  md: "text-3xl sm:text-4xl",
  lg: "text-4xl sm:text-5xl",
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  size = "md",
  action,
  className = "",
  ...props
}: SectionTitleProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4",
        alignClasses[align],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div
        className={[
          "flex w-full gap-6",
          align === "center"
            ? "flex-col items-center"
            : "flex-col items-start sm:flex-row sm:items-end sm:justify-between",
        ].join(" ")}
      >
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">
              {eyebrow}
            </p>
          )}

          <h2
            className={[
              "font-semibold tracking-tight text-brand-950",
              titleSizeClasses[size],
            ].join(" ")}
          >
            {title}
          </h2>

          {description && (
            <div className="mt-4 text-base leading-7 text-[#666666] sm:text-lg">
              {description}
            </div>
          )}
        </div>

        {action && (
          <div
            className={[
              "shrink-0",
              align === "center" ? "mt-2" : "",
            ].join(" ")}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
}