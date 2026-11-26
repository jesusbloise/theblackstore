import { requireAdminApi } from "@/lib/auth/require-admin-api";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const optionalDimensionSchema = z
  .number()
  .int()
  .positive()
  .nullable()
  .optional();

const updateVariantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "El nombre de la variante es obligatorio.",
    ),

  sku: z
    .string()
    .trim()
    .min(
      2,
      "El SKU es obligatorio.",
    ),

  price: z
    .number()
    .int()
    .min(
      0,
      "El precio no puede ser negativo.",
    ),

  compareAtPrice: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  stock: z
    .number()
    .int()
    .min(
      0,
      "El stock no puede ser negativo.",
    ),

  attributes: z.array(z.object({ name: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(80) })).max(6).optional(),

  measure: z
    .string()
    .trim()
    .optional(),

  density: z
    .string()
    .trim()
    .optional(),

  height: z
    .string()
    .trim()
    .optional(),

  lengthCm: optionalDimensionSchema,
  widthCm: optionalDimensionSchema,
  heightCm: optionalDimensionSchema,

  manageInventory: z
    .boolean()
    .optional(),

  allowBackorder: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const {
      id: productId,
      variantId,
    } = await params;

    const body =
      await request.json();

    const validation =
      updateVariantSchema.safeParse(
        body,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error
              .issues[0]?.message ??
            "Los datos de la variante no son válidos.",
          errors:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data =
      validation.data;

    /*
     * Confirmamos que la variante exista
     * y pertenezca realmente al producto.
     */
    const variant =
      await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
        },

        select: {
          id: true,
        },
      });

    if (!variant) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La variante no existe.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * El SKU debe seguir siendo único,
     * pero podemos conservar el SKU de
     * la propia variante.
     */
    const normalizedSku =
      data.sku
        .trim()
        .toUpperCase();

    const existingSku =
      await prisma.productVariant.findFirst({
        where: {
          sku: normalizedSku,

          id: {
            not: variantId,
          },
        },

        select: {
          id: true,
        },
      });

    if (existingSku) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Ya existe otra variante con ese SKU.",
        },
        {
          status: 409,
        },
      );
    }

  const updatedVariant =
  await prisma.$transaction(
    async (transaction) => {
      const currentVariant =
        await transaction.productVariant.findFirst({
          where: {
            id: variantId,
            productId,
          },
          select: {
            isActive: true,
            product: {
              select: {
                status: true,
              },
            },
          },
        });

      if (!currentVariant) {
        throw new Error("VARIANT_NOT_FOUND");
      }

      const nextIsActive =
        data.isActive ?? currentVariant.isActive;

      const willBeValid =
        nextIsActive && data.price > 0;

      if (
        currentVariant.product.status === "PUBLISHED" &&
        !willBeValid
      ) {
        const remainingValidVariants =
          await transaction.productVariant.count({
            where: {
              productId,
              id: {
                not: variantId,
              },
              isActive: true,
              price: {
                gt: 0,
              },
            },
          });

        if (remainingValidVariants === 0) {
          throw new Error("LAST_VALID_VARIANT");
        }
      }

      const updated =
            await transaction.productVariant.update({
              where: {
                id: variantId,
              },

              data: {
                name:
                  data.name.trim(),

                sku:
                  normalizedSku,

                price:
                  data.price,

                compareAtPrice:
                  data.compareAtPrice,

                stock:
                  data.stock,

                lengthCm:
                  data.lengthCm,

                widthCm:
                  data.widthCm,

                heightCm:
                  data.heightCm,

                manageInventory:
                  data.manageInventory,

                allowBackorder:
                  data.allowBackorder,

                isActive:
                  data.isActive,
              },
            });

          /*
           * Recreamos únicamente los atributos
           * comerciales de la variante.
           */
          await transaction.variantAttribute.deleteMany({
            where: {
              variantId,
            },
          });

          const attributes: {
            variantId: string;
            name: string;
            value: string;
            sortOrder: number;
          }[] = [];

          if (data.measure) {
            attributes.push({
              variantId,
              name: "Medida",
              value:
                data.measure.trim(),
              sortOrder: 1,
            });
          }

          if (data.density) {
            attributes.push({
              variantId,
              name: "Densidad",
              value:
                data.density.trim(),
              sortOrder: 2,
            });
          }

          if (data.height) {
            attributes.push({
              variantId,
              name: "Altura",
              value:
                data.height.trim(),
              sortOrder: 3,
            });
          }

          if (data.attributes !== undefined) {
            attributes.length = 0;
            data.attributes.forEach((attribute, index) => attributes.push({
              variantId,
              name: attribute.name,
              value: attribute.value,
              sortOrder: index + 1,
            }));
          }

          if (
            attributes.length > 0
          ) {
            await transaction.variantAttribute.createMany({
              data: attributes,
            });
          }

         return updated;
        },
        {
          isolationLevel: "Serializable",
        },
      );

    return NextResponse.json({
      ok: true,
      variant:
        updatedVariant,
    });
  } catch (error) {
  if (
    error instanceof Error &&
    error.message === "LAST_VALID_VARIANT"
  ) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "El producto está publicado y debe conservar al menos una variante activa con precio mayor a $0. Archiva el producto o activa otra variante válida.",
      },
      { status: 409 },
    );
  }

  if (
    error instanceof Error &&
    error.message === "VARIANT_NOT_FOUND"
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: "La variante no existe.",
      },
      { status: 404 },
    );
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? error.code
      : undefined;

  if (code === "P2034") {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Existe otra operación en curso. Actualiza la página e inténtalo nuevamente.",
      },
      { status: 409 },
    );
  }

  if (code === "P2002") {
    return NextResponse.json(
      {
        ok: false,
        message: "El SKU o algún atributo está duplicado.",
      },
      { status: 409 },
    );
  }

  console.error(
    "Error actualizando variante:",
    error,
  );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible actualizar la variante.",
      },
      {
        status: 500,
      },
    );
  }
}
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const {
      id: productId,
      variantId,
    } = await params;

    const result = await prisma.$transaction(
      async (transaction) => {
        const variant =
          await transaction.productVariant.findFirst({
            where: {
              id: variantId,
              productId,
            },
            select: {
              id: true,
            },
          });

        if (!variant) {
          return "NOT_FOUND";
        }

        const orderItem =
          await transaction.orderItem.findFirst({
            where: {
              variantId,
            },
            select: {
              id: true,
            },
          });

        if (orderItem) {
  return "HAS_ORDERS";
}

const product = await transaction.product.findUnique({
  where: {
    id: productId,
  },
  select: {
    status: true,
  },
});

if (product?.status === "PUBLISHED") {
  const remainingValidVariants =
    await transaction.productVariant.count({
      where: {
        productId,
        id: {
          not: variantId,
        },
        isActive: true,
        price: {
          gt: 0,
        },
      },
    });

  if (remainingValidVariants === 0) {
    return "LAST_VALID_VARIANT";
  }
}

        const deleted =
          await transaction.productVariant.deleteMany({
            where: {
              id: variantId,
              productId,
            },
          });

        return deleted.count === 1
          ? "DELETED"
          : "CONFLICT";
      },
      {
        isolationLevel: "Serializable",
      },
    );

    if (result === "NOT_FOUND") {
      return NextResponse.json(
        {
          ok: false,
          message: "La variante no existe.",
        },
        { status: 404 },
      );
    }

    if (result === "HAS_ORDERS") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Esta variante tiene pedidos asociados y no puede eliminarse. Puedes desactivarla para retirarla de la tienda sin perder el historial de compras.",
        },
        { status: 409 },
      );
    }

    if (result === "LAST_VALID_VARIANT") {
  return NextResponse.json(
    {
      ok: false,
      message:
        "No puedes eliminar esta variante porque el producto está publicado y debe conservar al menos una variante activa con precio mayor a $0. Archiva el producto o agrega otra variante válida.",
    },
    { status: 409 },
  );
}

if (result !== "DELETED") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "La variante fue modificada por otra operación. Actualiza la página.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Variante eliminada correctamente.",
    });

  } catch (error) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? error.code
        : undefined;

    if (code === "P2003") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Esta variante tiene registros asociados que impiden su eliminación. Puedes desactivarla.",
        },
        { status: 409 },
      );
    }

    if (code === "P2034") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Existe otra operación en curso. Actualiza la página e inténtalo nuevamente.",
        },
        { status: 409 },
      );
    }

    console.error(
      "Error eliminando variante:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible eliminar la variante.",
      },
      { status: 500 },
    );
  }
}