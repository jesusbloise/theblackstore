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
    .default(true),

  allowBackorder: z
    .boolean()
    .default(false),

  isActive: z
    .boolean()
    .default(true),
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
                  data.compareAtPrice ??
                  null,

                stock:
                  data.stock,

                lengthCm:
                  data.lengthCm ??
                  null,

                widthCm:
                  data.widthCm ??
                  null,

                heightCm:
                  data.heightCm ??
                  null,

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

          if (
            attributes.length > 0
          ) {
            await transaction.variantAttribute.createMany({
              data: attributes,
            });
          }

          return updated;
        },
      );

    return NextResponse.json({
      ok: true,
      variant:
        updatedVariant,
    });
  } catch (error) {
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

    await prisma.productVariant.delete({
      where: {
        id: variantId,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
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
      {
        status: 500,
      },
    );
  }
}