import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type CatalogParams = {
  q?: string;
  orden?: string;
  min?: string;
  max?: string;
  pagina?: string;
  categoria?: string;
  disponible?: string;
};

const PAGE_SIZE = 12;
const parsePrice = (value?: string) => {
  if (!value || !/^\d{1,9}$/.test(value)) return undefined;
  return Number(value);
};

export async function loadCatalog(params: CatalogParams, categoryIds?: string[]) {
  const q = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const min = parsePrice(params.min);
  const max = parsePrice(params.max);
  const order = ["recientes", "precio-asc", "precio-desc", "nombre"].includes(params.orden ?? "")
    ? params.orden! : "recientes";
  const requestedPage = Number(params.pagina);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;

  const variantCondition: Prisma.ProductVariantWhereInput = {
    isActive: true,
    price: { gt: 0, ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) },
    ...(params.disponible === "1" ? { OR: [{ manageInventory: false }, { stock: { gt: 0 } }, { allowBackorder: true }] } : {}),
  };
  const where: Prisma.ProductWhereInput = {
    status: "PUBLISHED",
    variants: { some: variantCondition },
    ...(categoryIds ? { categories: { some: { categoryId: { in: categoryIds } } } } : params.categoria ? { categories: { some: { category: { isActive: true, OR: [{ slug: params.categoria }, { parent: { slug: params.categoria, isActive: true } }] } } } } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }] } : {}),
  };

  // For price sorting, order by the lowest eligible variant price, not product creation date.
  // Prisma relation aggregate ordering by a filtered variant is not available here, so we
  // first retrieve matching IDs and their minimum eligible prices, then paginate in memory.
  // This is an exact result set, unlike slicing the first 48 products.
  const count = await prisma.product.count({ where });
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const priceSort = order === "precio-asc" || order === "precio-desc";
  const products = await prisma.product.findMany({
      ...(!priceSort ? { skip: (currentPage - 1) * PAGE_SIZE, take: PAGE_SIZE } : {}),
      where,
      orderBy: order === "nombre" ? [{ name: "asc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "asc" }],
      select: {
        id: true, name: true, slug: true, createdAt: true,
        _count: { select: { variants: { where: { isActive: true, price: { gt: 0 }, OR: [{ manageInventory: false }, { stock: { gt: 0 } }, { allowBackorder: true }] } } } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 2, select: { url: true } },
        categories: { take: 1, select: { category: { select: { name: true } } } },
        variants: { where: variantCondition, orderBy: { price: "asc" }, take: 1, select: { price: true, compareAtPrice: true } },
      },
    });
  if (order === "precio-asc" || order === "precio-desc") {
    const sign = order === "precio-asc" ? 1 : -1;
    products.sort((a, b) => sign * (a.variants[0].price - b.variants[0].price) || a.name.localeCompare(b.name, "es"));
  }
  return { products: priceSort ? products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) : products, count, pages, page: currentPage, order, min, max, q };
}
