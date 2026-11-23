import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type CatalogParams = {
  q?: string;
  orden?: string;
  min?: string;
  max?: string;
  pagina?: string;
};

const PAGE_SIZE = 12;
const parsePrice = (value?: string) => {
  if (!value || !/^\d{1,9}$/.test(value)) return undefined;
  return Number(value);
};

export async function loadCatalog(params: CatalogParams, categoryIds?: string[]) {
  const q = (params.q ?? "").trim().slice(0, 100);
  const min = parsePrice(params.min);
  const max = parsePrice(params.max);
  const order = ["recientes", "precio-asc", "precio-desc", "nombre"].includes(params.orden ?? "")
    ? params.orden! : "recientes";
  const requestedPage = Number(params.pagina);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;

  const variantCondition: Prisma.ProductVariantWhereInput = {
    isActive: true,
    ...(min !== undefined ? { price: { gte: min, ...(max !== undefined ? { lte: max } : {}) } } : max !== undefined ? { price: { lte: max } } : {}),
    OR: [{ manageInventory: false }, { stock: { gt: 0 } }, { allowBackorder: true }],
  };
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    variants: { some: variantCondition },
    ...(categoryIds ? { categories: { some: { categoryId: { in: categoryIds } } } } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }] } : {}),
  };

  // For price sorting, order by the lowest eligible variant price, not product creation date.
  // Prisma relation aggregate ordering by a filtered variant is not available here, so we
  // first retrieve matching IDs and their minimum eligible prices, then paginate in memory.
  // This is an exact result set, unlike slicing the first 48 products.
  const [count, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: order === "nombre" ? { name: "asc" } : { createdAt: "desc" },
      select: {
        id: true, name: true, slug: true, createdAt: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1, select: { url: true } },
        categories: { take: 1, select: { category: { select: { name: true } } } },
        variants: { where: variantCondition, orderBy: { price: "asc" }, take: 1, select: { price: true, compareAtPrice: true } },
      },
    }),
  ]);
  if (order === "precio-asc" || order === "precio-desc") {
    const sign = order === "precio-asc" ? 1 : -1;
    products.sort((a, b) => sign * (a.variants[0].price - b.variants[0].price) || a.name.localeCompare(b.name, "es"));
  }
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  return { products: products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), count, pages, page: currentPage, order, min, max, q };
}
