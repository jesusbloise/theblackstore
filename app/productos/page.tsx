import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import type { CatalogParams } from "@/lib/catalog";

export const metadata: Metadata = { title: "Todos los productos", description: "Explora el catálogo de The Black Store.", ...(getSiteUrl() ? { alternates: { canonical: "/productos" } } : {}) };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogParams> }) {
  const params = await searchParams;
  return <main className="py-12 sm:py-16"><Container>
    <p className="text-xs uppercase tracking-[.24em] text-[#927451]">Colección</p>
    <h1 className="mt-3 text-4xl font-medium">Todos los productos</h1>
    <p className="mt-3 text-sm text-[#777]">Explora nuestra selección y encuentra lo que buscas.</p>
    <Suspense fallback={<p className="mt-8">Cargando catálogo…</p>}><CatalogGrid params={params} /></Suspense>
  </Container></main>;
}
