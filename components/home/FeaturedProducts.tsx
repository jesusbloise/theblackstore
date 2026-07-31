import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/products/ProductCard";

const products = [
  {
    name: "Colchón Espuma Premium",
    category: "Colchones",
    price: 169990,
    originalPrice: 219990,
    href: "/producto/colchon-espuma-premium",
  },
  {
    name: "Cama Europea Boston",
    category: "Camas",
    price: 249990,
    originalPrice: 299990,
    href: "/producto/cama-europea-boston",
  },
  {
    name: "Camarote Metálico Eco",
    category: "Camarotes",
    price: 189990,
    href: "/producto/camarote-metalico-eco",
  },
  {
    name: "Colchón Resortes Premium",
    category: "Colchones",
    price: 229990,
    originalPrice: 279990,
    href: "/producto/colchon-resortes-premium",
  },
];

export function FeaturedProducts() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Productos destacados
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Los favoritos para renovar tu descanso
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Una selección de camas, colchones y productos destacados de
              Incal.
            </p>
          </div>

          <Link
            href="/productos"
            className="text-sm font-semibold text-slate-950 hover:text-slate-600"
          >
            Ver todos los productos →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.name}
              name={product.name}
              category={product.category}
              price={product.price}
              originalPrice={product.originalPrice}
              href={product.href}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}