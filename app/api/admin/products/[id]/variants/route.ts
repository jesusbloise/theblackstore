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

const createVariantSchema = z.object({
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
    .min(2, "El SKU es obligatorio."),

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
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext,
) {
  const unauthorized = await requireAdminApi();

  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id: productId } =
      await params;

    const body = await request.json();

    const validation =
      createVariantSchema.safeParse(
        body,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message:
            validation.error.issues[0]
              ?.message ??
            "Los datos de la variante no son válidos.",
          errors:
            validation.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const data = validation.data;

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "El producto no existe.",
        },
        {
          status: 404,
        },
      );
    }

    const normalizedSku = data.sku.trim().toUpperCase();

const existingSku =
  await prisma.productVariant.findUnique({
    where: {
      sku: normalizedSku,
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
            "Ya existe una variante con ese SKU.",
        },
        {
          status: 409,
        },
      );
    }

    const lastVariant =
      await prisma.productVariant.findFirst({
        where: {
          productId,
        },
        orderBy: {
          sortOrder: "desc",
        },
        select: {
          sortOrder: true,
        },
      });

    const variant =
      await prisma.$transaction(
        async (transaction) => {
          const createdVariant =
            await transaction.productVariant.create({
              data: {
                productId,
                name: data.name,
                sku: normalizedSku,

                price: data.price,

                compareAtPrice:
                  data.compareAtPrice ??
                  null,

                stock: data.stock,

                lengthCm:
                  data.lengthCm ?? null,

                widthCm:
                  data.widthCm ?? null,

                heightCm:
                  data.heightCm ?? null,

                manageInventory:
                  data.manageInventory,

                allowBackorder:
                  data.allowBackorder,

                isActive:
                  data.isActive,

                sortOrder:
                  (lastVariant?.sortOrder ??
                    0) + 1,
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
              variantId:
                createdVariant.id,
              name: "Medida",
              value: data.measure,
              sortOrder: 1,
            });
          }

          if (data.density) {
            attributes.push({
              variantId:
                createdVariant.id,
              name: "Densidad",
              value: data.density,
              sortOrder: 2,
            });
          }

          if (data.height) {
            attributes.push({
              variantId:
                createdVariant.id,
              name: "Altura",
              value: data.height,
              sortOrder: 3,
            });
          }

          if (data.attributes !== undefined) {
            attributes.length = 0;
            data.attributes.forEach((attribute, index) => attributes.push({
              variantId: createdVariant.id,
              name: attribute.name,
              value: attribute.value,
              sortOrder: index + 1,
            }));
          }

          if (attributes.length > 0) {
            await transaction.variantAttribute.createMany({
              data: attributes,
            });
          }

          return createdVariant;
        },
      );

    return NextResponse.json(
      {
        ok: true,
        variant,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? error.code
      : undefined;

  if (code === "P2002") {
    return NextResponse.json(
      {
        ok: false,
        message: "Ya existe una variante con ese SKU o un atributo duplicado.",
      },
      { status: 409 },
    );
  }

  console.error(
    "Error creando variante:",
    error,
  );
    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible crear la variante.",
      },
      {
        status: 500,
      },
    );
  }
}