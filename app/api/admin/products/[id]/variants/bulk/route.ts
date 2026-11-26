import { ADMIN_PERMISSIONS } from "@/lib/auth/admin-permissions";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { ProductStatus } from "@/lib/generated/prisma/client";

const variantSchema = z.object({
  id: z.string().min(1).optional(),

  updatedAt: z.string().datetime().optional(),

  name: z.string().trim().min(2).max(200),

  sku: z
    .string()
    .trim()
    .min(2)
    .max(150)
    .transform((value) => value.toUpperCase()),

  price: z.number().int().min(0).max(2147483647),

  stock: z.number().int().min(0).max(2147483647),

  isActive: z.boolean(),

  attributes: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(40),
        value: z.string().trim().min(1).max(80),
      }),
    )
    .max(6),
}).superRefine((variant, ctx) => {
  if (variant.id && !variant.updatedAt) {
    ctx.addIssue({
      code: "custom",
      path: ["updatedAt"],
      message: "Falta la versión original de la variante.",
    });
  }

  if (
    new Set(
      variant.attributes.map((attribute) =>
        attribute.name.toLowerCase(),
      ),
    ).size !== variant.attributes.length
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["attributes"],
      message: "Los nombres de los atributos no pueden repetirse.",
    });
  }
});

const bulkSchema = z.object({
  variants: z.array(variantSchema).min(1).max(100),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

class BulkError extends Error {
  constructor(
    message: string,
    public readonly status: number = 409,
  ) {
    super(message);
    this.name = "BulkError";
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi(request, ADMIN_PERMISSIONS.INVENTORY_MANAGE);

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } = await params;

    const validation = bulkSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error.issues[0]?.message ??
            "Los datos de las variantes no son válidos.",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { variants } = validation.data;

    const ids = variants
      .map((variant) => variant.id)
      .filter((id): id is string => Boolean(id));

    if (new Set(ids).size !== ids.length) {
      throw new BulkError(
        "Hay variantes repetidas en la solicitud.",
        400,
      );
    }

    const skus = variants.map(
      (variant) => variant.sku,
    );

    if (new Set(skus).size !== skus.length) {
      throw new BulkError(
        "Los SKU no pueden repetirse.",
        400,
      );
    }

    const savedVariants = await prisma.$transaction(
      async (transaction) => {
        const product =
          await transaction.product.findUnique({
            where: {
              id: productId,
            },
            select: {
              id: true,
              status: true,
            },
          });

        if (!product) {
          throw new BulkError(
            "El producto no existe.",
            404,
          );
        }

        const currentVariants =
          await transaction.productVariant.findMany({
            where: {
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

        const currentById = new Map(
          currentVariants.map((variant) => [
            variant.id,
            variant,
          ]),
        );

        // Validar pertenencia y versiones originales.

        for (const variant of variants) {
          if (!variant.id) continue;

          const current = currentById.get(variant.id);

          if (!current) {
            throw new BulkError(
              `La variante ${variant.sku} ya no existe o no pertenece al producto.`,
            );
          }

          if (
            current.updatedAt.toISOString() !==
            variant.updatedAt
          ) {
           
            throw new BulkError(
              `La variante ${variant.sku} fue modificada desde que abriste el editor. Recarga la página antes de guardar.`,
            );
          }
        }

        // Comprobar disponibilidad de los SKU.

        const occupiedSkus =
          await transaction.productVariant.findMany({
            where: {
              sku: {
                in: skus,
              },
            },
            select: {
              id: true,
              sku: true,
            },
          });

        const occupiedBySku = new Map(
          occupiedSkus.map((variant) => [
            variant.sku,
            variant.id,
          ]),
        );

        for (const variant of variants) {
          const ownerId =
            occupiedBySku.get(variant.sku);

          if (ownerId && ownerId !== variant.id) {
            throw new BulkError(
              `El SKU ${variant.sku} ya está asignado a otra variante.`,
            );
          }
        }

        // Validar el estado final del producto.

        const changesById = new Map(
          variants
            .filter((variant) => variant.id)
            .map((variant) => [
              variant.id,
              variant,
            ]),
        );

        const finalVariants = [
          ...currentVariants.map(
            (current) =>
              changesById.get(current.id) ?? current,
          ),

          ...variants.filter(
            (variant) => !variant.id,
          ),
        ];

        if (
          product.status === ProductStatus.PUBLISHED &&
          !finalVariants.some(
            (variant) =>
              variant.isActive && variant.price > 0,
          )
        ) {
          throw new BulkError(
            "El producto está publicado y debe conservar al menos una variante activa con precio mayor a $0.",
          );
        }

        let nextSortOrder = currentVariants.reduce(
          (maximum, variant) =>
            Math.max(maximum, variant.sortOrder),
          0,
        );

        // Crear o actualizar las variantes.

        for (const variant of variants) {
          let variantId: string;

          if (variant.id) {
            const updated =
              await transaction.productVariant.updateMany({
                where: {
                  id: variant.id,
                  productId,
                  updatedAt: new Date(
                    variant.updatedAt!,
                  ),
                },
                data: {
                  name: variant.name,
                  sku: variant.sku,
                  price: variant.price,
                  stock: variant.stock,
                  isActive: variant.isActive,
                },
              });

            if (updated.count !== 1) {
              throw new BulkError(
                `La variante ${variant.sku} cambió durante el guardado.`,
              );
            }

            variantId = variant.id;

            await transaction.variantAttribute.deleteMany({
              where: {
                variantId,
              },
            });
          } else {
            const created =
              await transaction.productVariant.create({
                data: {
                  productId,
                  name: variant.name,
                  sku: variant.sku,
                  price: variant.price,
                  stock: variant.stock,
                  isActive: variant.isActive,
                  manageInventory: true,
                  allowBackorder: false,
                  sortOrder: ++nextSortOrder,
                },
              });

            variantId = created.id;
          }

          if (variant.attributes.length > 0) {
            await transaction.variantAttribute.createMany({
              data: variant.attributes.map(
                (attribute, index) => ({
                  variantId,
                  name: attribute.name,
                  value: attribute.value,
                  sortOrder: index + 1,
                }),
              ),
            });
          }
        }

        // Devolver el inventario actualizado.

        return transaction.productVariant.findMany({
          where: {
            productId,
          },
          orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
          ],
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            isActive: true,
            updatedAt: true,
            attributes: {
              orderBy: {
                sortOrder: "asc",
              },
              select: {
                name: true,
                value: true,
              },
            },
          },
        });
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 30000,
      },
    );

    return NextResponse.json({
      ok: true,
      message:
        "Inventario guardado correctamente.",
      variants: savedVariants.map((variant) => ({
        ...variant,
        updatedAt: variant.updatedAt.toISOString(),
      })),
    });

  } catch (error) {
    if (error instanceof BulkError) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: error.status },
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
            "Existe otra operación de inventario en curso. Recarga la página antes de reintentar.",
        },
        { status: 409 },
      );
    }

    if (code === "P2002") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Existe un SKU o atributo duplicado. No se guardó ninguna modificación.",
        },
        { status: 409 },
      );
    }

    if (code === "P2028") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Se agotó el tiempo de la operación. No se completó el guardado.",
        },
        { status: 503 },
      );
    }

    console.error(
      "Error guardando inventario:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible guardar el inventario.",
      },
      { status: 500 },
    );
  }
}
