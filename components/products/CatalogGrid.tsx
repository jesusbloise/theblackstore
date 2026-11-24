import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { CatalogControls } from "@/components/products/CatalogControls";
import type { CatalogParams } from "@/lib/catalog";
import { loadCatalog } from "@/lib/catalog";

export async function CatalogGrid({ params, categoryIds }: { params: CatalogParams; categoryIds?: string[] }) {
  const { products, count, page, pages } = await loadCatalog(params, categoryIds);
  const categories = categoryIds ? [] : await prisma.category.findMany({ where: { isActive: true, parentId: null }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { name: true, slug: true } });
  const pageHref = (number: number) => {
    const query = new URLSearchParams();
    for (const key of ["q", "min", "max", "orden", "categoria", "disponible"] as const) {
      const value = params[key];
      if (value) query.set(key, value);
    }
    query.set("pagina", String(number));
    return `?${query.toString()}`;
  };
  return <>
    <CatalogControls key={JSON.stringify(params)} count={count} categories={categories} />
    {products.length === 0 ? <p className="py-16 text-center text-[#777]">Todavía no hay productos para mostrar en esta selección.</p> :
      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} name={product.name} category={product.categories[0]?.category.name ?? "Colección"} price={product.variants[0].price} originalPrice={product.variants[0].compareAtPrice ?? undefined} href={`/producto/${product.slug}`} image={product.images[0]?.url} secondaryImage={product.images[1]?.url} soldOut={product._count.variants === 0} isNew={Date.now() - product.createdAt.getTime() < 30 * 86400000} />)}</div>}
    {pages > 1 && <nav aria-label="Páginas de productos" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 && <Link href={pageHref(page - 1)} className="border border-[#ded6c9] bg-white px-4 py-2">Anterior</Link>}
      <span>Página {page} de {pages}</span>
      {page < pages && <Link href={pageHref(page + 1)} className="border border-[#ded6c9] bg-white px-4 py-2">Siguiente</Link>}
    </nav>}
  </>;
}
