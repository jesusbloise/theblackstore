import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CatalogGrid } from "@/components/products/CatalogGrid";
import { Container } from "@/components/ui/Container";
import type { CatalogParams } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true, description: true, isActive: true, parent: { select: { isActive: true } } } });
  if (!category?.isActive || (category.parent && !category.parent.isActive)) return { title: "Categoría no encontrada", robots: { index: false, follow: false } };
  return { title: category.name, description: (category.description || `Explora ${category.name} en The Black Store.`).slice(0,160), ...(getSiteUrl() ? { alternates: { canonical: `/categoria/${encodeURIComponent(slug)}` } } : {}) };
}
export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<CatalogParams> }) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({ where: { slug }, select: {
    id: true, name: true, description: true, slug: true, isActive: true,
    parent: { select: { name: true, slug: true, isActive: true } },
    children: { where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true } },
  } });
  if (!category?.isActive || (category.parent && !category.parent.isActive)) notFound();
  const ids = [category.id, ...category.children.map((child) => child.id)];
  return <main className="py-12 sm:py-16"><Container>
    <nav aria-label="Ruta de navegación" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#777]">
      <Link href="/" className="hover:text-[#101010]">Inicio</Link><span>/</span>
      {category.parent && <><Link href={`/categoria/${category.parent.slug}`} className="hover:text-[#101010]">{category.parent.name}</Link><span>/</span></>}
      <span className="text-[#101010]">{category.name}</span>
    </nav>
    <p className="text-xs uppercase tracking-[.24em] text-[#927451]">Colección</p>
    <h1 className="mt-3 text-4xl font-medium">{category.name}</h1>
    {category.description && <p className="mt-3 max-w-2xl text-sm text-[#777]">{category.description}</p>}
    {category.children.length > 0 && <nav aria-label={`Subcategorías de ${category.name}`} className="mt-8 flex flex-wrap gap-3">
      <span className="rounded-full bg-[#101010] px-5 py-2.5 text-sm text-white">Ver todas</span>
      {category.children.map((child) => <Link key={child.id} href={`/categoria/${child.slug}`} className="rounded-full border border-[#ded6c9] bg-white px-5 py-2.5 text-sm hover:border-[#101010]">{child.name}</Link>)}
    </nav>}
    <Suspense fallback={<p className="mt-8">Cargando catálogo…</p>}><CatalogGrid params={filters} categoryIds={ids} /></Suspense>
  </Container></main>;
}
