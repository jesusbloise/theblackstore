import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

type ProductCardProps = {
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  href: string;
};

export function ProductCard({
  name,
  category,
  price,
  originalPrice,
  href,
}: ProductCardProps) {
  const hasDiscount =
    typeof originalPrice === "number" &&
    originalPrice > price;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link
        href={href}
        className="relative block overflow-hidden bg-slate-100"
        aria-label={`Ver ${name}`}
      >
        <div className="relative flex aspect-square items-center justify-center p-6">
          {hasDiscount && (
            <Badge
              variant="sale"
              className="absolute left-4 top-4 z-10 bg-red-600 text-white"
            >
              Oferta
            </Badge>
          )}

          <span className="text-sm font-medium text-slate-400">
            Imagen del producto
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-medium text-slate-500">
          {category}
        </p>

        <Link href={href} className="mt-2">
          <h3 className="text-lg font-bold leading-6 text-slate-950 transition-colors group-hover:text-slate-600">
            {name}
          </h3>
        </Link>

        <div className="mt-4">
          <Price
            price={price}
            originalPrice={originalPrice}
            size="sm"
          />
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Hasta 12 cuotas sin interés
        </p>

        <div className="mt-auto pt-5">
          <Link
  href={href}
  aria-label={`Elegir medida para ${name}`}
  className="block"
>
  <Button
    variant="primary"
    size="md"
    fullWidth
  >
    <ShoppingCart size={18} />
    Elegir medida
    <ArrowRight size={17} />
  </Button>
</Link>
        </div>
      </div>
    </article>
  );
}