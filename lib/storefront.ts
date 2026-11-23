import { prisma } from "@/lib/prisma";

export async function getNavigationCategories() {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, imageUrl: true, children: {
      where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    } },
  });
}

export async function getStoreProducts(featuredOnly = false) {
  return prisma.product.findMany({
    where: { status: "PUBLISHED", ...(featuredOnly ? { isFeatured: true } : {}) },
    orderBy: { createdAt: "desc" },
    take: featuredOnly ? 8 : 48,
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
      categories: { include: { category: true }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { price: "asc" }, take: 1 },
    },
  });
}
