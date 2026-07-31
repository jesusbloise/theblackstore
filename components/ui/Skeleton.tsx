import type { HTMLAttributes } from "react";

type SkeletonVariant = "text" | "circular" | "rectangular";

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
};

const variantClasses: Record<SkeletonVariant, string> = {
  text: "rounded-md",
  circular: "rounded-full",
  rectangular: "rounded-xl",
};

function normalizeSize(value?: string | number) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  animated = true,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "bg-slate-200",
        variantClasses[variant],
        animated ? "animate-pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: normalizeSize(width),
        height: normalizeSize(height),
        ...style,
      }}
      {...props}
    />
  );
}
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="space-y-4 p-5">
        <Skeleton
          variant="text"
          className="h-4 w-24"
        />

        <div className="space-y-2">
          <Skeleton
            variant="text"
            className="h-5 w-full"
          />

          <Skeleton
            variant="text"
            className="h-5 w-3/4"
          />
        </div>

        <Skeleton
          variant="text"
          className="h-7 w-40"
        />

        <Skeleton
          variant="text"
          className="h-4 w-44"
        />

        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
}: {
  count?: number;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}