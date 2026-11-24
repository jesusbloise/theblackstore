type PriceProps = {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: {
    current: "text-lg",
    original: "text-sm",
  },
  md: {
    current: "text-2xl",
    original: "text-sm",
  },
  lg: {
    current: "text-4xl",
    original: "text-base",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Price({
  price,
  originalPrice,
  size = "md",
}: PriceProps) {
  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span
        className={`${sizeClasses[size].current} font-semibold tracking-tight text-[#101010]`}
      >
        {formatCurrency(price)}
      </span>

      {hasDiscount && (
        <>
          <span
            className={`${sizeClasses[size].original} text-[#777] line-through`}
          >
            {formatCurrency(originalPrice)}
          </span>

          <span className="bg-[#F0E9DD] px-2 py-1 text-xs font-medium text-[#59452D]">
            -{discountPercentage}%
          </span>
        </>
      )}
    </div>
  );
}