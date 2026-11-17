import { prisma } from "@/lib/prisma";

export async function getAdminProducts() {
  return prisma.product.findMany({
    include: {
      categories: {
        include: {
          category: true,
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

    orderBy: {
      createdAt: "desc",
    },
  });
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