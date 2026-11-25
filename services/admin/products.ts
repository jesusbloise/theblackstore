import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  stock?: "available" | "out" | "low";
  sort?: "newest" | "oldest" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
};
export async function getAdminProducts(
  filters: AdminProductFilters = {},
) {
  const conditions: Prisma.ProductWhereInput[] = [];

  const search = filters.search?.trim();

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { id: { equals: search } },
        {
          variants: {
            some: {
              sku: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  if (filters.categoryId) {
    conditions.push({
      categories: {
        some: {
          category: {
            OR: [
              { id: filters.categoryId },
              { parentId: filters.categoryId },
            ],
          },
        },
      },
    });
  }

  if (filters.subcategoryId) {
    conditions.push({
      categories: {
        some: {
          categoryId: filters.subcategoryId,
        },
      },
    });
  }

  if (filters.status) {
  conditions.push({
    status: filters.status,
  });
}

const availableVariant: Prisma.ProductVariantWhereInput = {
  isActive: true,
  price: { gt: 0 },
  OR: [
    { manageInventory: false },
    { allowBackorder: true },
    { stock: { gt: 0 } },
  ],
};

if (filters.stock === "available") {
  conditions.push({
    variants: {
      some: availableVariant,
    },
  });
}

if (filters.stock === "out") {
  conditions.push({
    variants: {
      none: availableVariant,
    },
  });
}

if (filters.stock === "low") {
  conditions.push({
    variants: {
      some: {
        isActive: true,
        manageInventory: true,
        stock: {
          gte: 1,
          lte: 5,
        },
      },
    },
  });
}
const page = Math.max(1, filters.page ?? 1);

const pageSize = Math.min(
  100,
  Math.max(1, filters.pageSize ?? 20),
);

  const where: Prisma.ProductWhereInput = {
  AND: conditions,
};

const sortOptions: Record<
  NonNullable<AdminProductFilters["sort"]>,
  Prisma.ProductOrderByWithRelationInput[]
> = {
  newest: [
    { createdAt: "desc" },
    { id: "desc" },
  ],
  oldest: [
    { createdAt: "asc" },
    { id: "asc" },
  ],
  "name-asc": [
    { name: "asc" },
    { id: "asc" },
  ],
  "name-desc": [
    { name: "desc" },
    { id: "desc" },
  ],
};

const orderBy = sortOptions[filters.sort ?? "newest"];

const [products, total] = await prisma.$transaction([
  prisma.product.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  where,
    include: {
      categories: {
        include: {
          category: {
            include: {
              parent: true,
            },
          },
        },
      },
      images: {
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
        ],
        take: 1,
      },
      variants: {
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy,
        }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
export async function getAdminProductById(
  productId: string,
) {
  return prisma.product.findUnique({
    where: {
      id: productId,
    },

    include: {
      categories: {
        include: {
          category: {
            include: {
              parent: true,
            },
          },
        },
      },

      images: {
        orderBy: [
          {
            isPrimary: "desc",
          },
          {
            sortOrder: "asc",
          },
        ],
      },

      variants: {
        orderBy: {
          sortOrder: "asc",
        },

        include: {
          attributes: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },

      features: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      specifications: {
  orderBy: {
    sortOrder: "asc",
  },
},
    },
  });
}
export async function getAdminVariantById(
  productId: string,
  variantId: string,
) {
  return prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
    },

    include: {
      attributes: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
}