import {
  ProductStatus,
  type ProductType,
} from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CatalogListProduct = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  category: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  sizes: string[];
  createdAt: Date;
};

export async function listPublishedProductsByParentCategory(
  parentCategorySlug: string,
): Promise<CatalogListProduct[]> {
  const parentCategory =
    await prisma.category.findUnique({
      where: {
        slug: parentCategorySlug,
      },
      select: {
        id: true,
        name: true,
        children: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  if (!parentCategory) {
    return [];
  }

  const categoryIds = [
    parentCategory.id,
    ...parentCategory.children.map(
      (category) => category.id,
    ),
  ];

  const products =
    await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
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
          include: {
            attributes: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return products.map((product) => {
    const firstVariant =
      product.variants[0];

    const childCategory =
      product.categories.find(
        ({ category }) =>
          category.id !==
          parentCategory.id,
      )?.category;

    const sizes = product.variants
      .map((variant) => {
        const measure =
          variant.attributes.find(
            (attribute) =>
              attribute.name === "Medida",
          );

        return measure?.value ?? variant.name;
      })
      .filter(
        (value, index, values) =>
          value.length > 0 &&
          values.indexOf(value) === index,
      );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      type: product.type,
      category:
        childCategory?.name ??
        parentCategory.name,
      price: firstVariant?.price ?? 0,
      compareAtPrice:
        firstVariant?.compareAtPrice ??
        undefined,
      image: product.images[0]?.url,
      sizes,
      createdAt: product.createdAt,
    };
  });
}
export type CatalogCategoryResult = {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  products: CatalogListProduct[];
};

export async function listPublishedProductsByCategorySlug(
  categorySlug: string,
): Promise<CatalogCategoryResult | null> {
  const category =
    await prisma.category.findUnique({
      where: {
        slug: categorySlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });

  if (!category || !category.isActive) {
    return null;
  }

  const products =
    await prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        categories: {
          some: {
            categoryId: category.id,
          },
        },
      },
      include: {
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
          include: {
            attributes: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? undefined,
    },

    products: products.map((product) => {
      const firstVariant =
        product.variants[0];

      const sizes = product.variants
        .map((variant) => {
          const measure =
            variant.attributes.find(
              (attribute) =>
                attribute.name === "Medida",
            );

          return measure?.value ?? variant.name;
        })
        .filter(
          (value, index, values) =>
            value.length > 0 &&
            values.indexOf(value) === index,
        );

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        type: product.type,
        category: category.name,
        price: firstVariant?.price ?? 0,
        compareAtPrice:
          firstVariant?.compareAtPrice ??
          undefined,
        image: product.images[0]?.url,
        sizes,
        createdAt: product.createdAt,
      };
    }),
  };
}
export type CatalogProductDetail = {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  shortDescription?: string;
  description?: string;
  brand?: string;
  warranty?: string;
  manufacturingDays?: number;

  customMattress?: {
    density: string;
    minimumLengthCm: number;
    maximumLengthCm: number;
    minimumWidthCm: number;
    maximumWidthCm: number;
    allowedThicknessCm: number[];
    basePricePerSquareM: number;
  };

  category?: {
    id: string;
    name: string;
    slug: string;
  };

  images: string[];
  features: string[];

  specifications: {
    label: string;
    value: string;
  }[];

  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    manageInventory: boolean;
    allowBackorder: boolean;
    attributes: {
      name: string;
      value: string;
    }[];
  }[];
};

export async function getPublishedProductBySlug(
  slug: string,
): Promise<CatalogProductDetail | null> {
  const product =
    await prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLISHED,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },

        customMattress: true,

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

        variants: {
          where: {
            isActive: true,
          },
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
      },
    });

  if (!product) {
    return null;
  }

  const primaryCategory =
    product.categories.find(
      ({ category }) =>
        category.parentId !== null,
    )?.category ??
    product.categories[0]?.category;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type,

    shortDescription:
      product.shortDescription ??
      undefined,

    description:
      product.description ??
      undefined,

    brand:
      product.brand ??
      undefined,

    warranty:
      product.warranty ??
      undefined,

    manufacturingDays:
      product.manufacturingDays ??
      undefined,

    category: primaryCategory
      ? {
          id: primaryCategory.id,
          name: primaryCategory.name,
          slug: primaryCategory.slug,
        }
      : undefined,

      customMattress: product.customMattress
  ? {
      density:
        product.customMattress.density,

      minimumLengthCm:
        product.customMattress.minimumLengthCm,

      maximumLengthCm:
        product.customMattress.maximumLengthCm,

      minimumWidthCm:
        product.customMattress.minimumWidthCm,

      maximumWidthCm:
        product.customMattress.maximumWidthCm,

      allowedThicknessCm:
        product.customMattress.allowedThicknessCm,

      basePricePerSquareM:
        product.customMattress.basePricePerSquareM,
    }
  : undefined,

    images: product.images.map(
      (image) => image.url,
    ),

    features: product.features.map(
      (feature) => feature.text,
    ),

    specifications:
      product.specifications.map(
        (specification) => ({
          label: specification.label,
          value: specification.value,
        }),
      ),

    variants: product.variants.map(
      (variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price,

        compareAtPrice:
          variant.compareAtPrice ??
          undefined,

        stock: variant.stock,

        manageInventory:
          variant.manageInventory,

        allowBackorder:
          variant.allowBackorder,

        attributes:
          variant.attributes.map(
            (attribute) => ({
              name: attribute.name,
              value: attribute.value,
            }),
          ),
      }),
    ),
  };
}