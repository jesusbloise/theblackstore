import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  if (!site) return [];
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "PUBLISHED", type: { not: "CUSTOM_MATTRESS" }, variants: { some: { isActive: true, price: { gt: 0 } } } }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { isActive: true, OR: [{ parentId: null }, { parent: { isActive: true } }] }, select: { slug: true, updatedAt: true } }),
  ]);
  return [ { url: site.href }, { url: new URL("/productos", site).href }, ...products.map(p => ({ url: new URL(`/producto/${encodeURIComponent(p.slug)}`, site).href, lastModified: p.updatedAt })), ...categories.map(c => ({ url: new URL(`/categoria/${encodeURIComponent(c.slug)}`, site).href, lastModified: c.updatedAt })) ];
}
