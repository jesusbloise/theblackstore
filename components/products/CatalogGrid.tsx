import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { CatalogControls } from "@/components/products/CatalogControls";
import type { CatalogParams } from "@/lib/catalog";
import { loadCatalog } from "@/lib/catalog";

export async function CatalogGrid({ params, categoryIds }: { params: CatalogParams; categoryIds?: string[] }) {
  const { products, count, page, pages } = await loadCatalog(params, categoryIds);
  const pageHref = (number: number) => {
    const query = new URLSearchParams();
    for (const key of ["q", "min", "max", "orden"] as const) {
      const value = params[key];
      if (value) query.set(key, value);
    }
    query.set("pagina", String(number));
    return `?${query.toString()}`;
  };
  return <>
    <CatalogControls count={count} />
    {products.length === 0 ? <p className="py-16 text-center text-[#777]">Todavía no hay productos para mostrar en esta selección.</p> :
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} name={product.name} category={product.categories[0]?.category.name ?? "Colección"} price={product.variants[0].price} originalPrice={product.variants[0].compareAtPrice ?? undefined} href={`/producto/${product.slug}`} image={product.images[0]?.url} />)}</div>}
    {pages > 1 && <nav aria-label="Páginas de productos" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 && <Link href={pageHref(page - 1)} className="border border-[#ded6c9] bg-white px-4 py-2">Anterior</Link>}
      <span>Página {page} de {pages}</span>
      {page < pages && <Link href={pageHref(page + 1)} className="border border-[#ded6c9] bg-white px-4 py-2">Siguiente</Link>}
    </nav>}
  </>;
}
